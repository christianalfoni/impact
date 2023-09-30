import { Component, ReactNode, createContext, useContext } from "react";

const currentStoresContainer: StoresContainer[] = [];

export type Store<T, A extends any[]> = (...args: A) => T;

export type StoreState =
  | {
      isResolved: true;
      value: any;
    }
  | {
      isResolved: false;
      constr: () => any;
    };

class StoresContainer {
  private _stores = new Map<Store<any, any[]>, StoreState>();
  private _disposers = new Set<() => void>();
  private _isDisposed = false;

  get isDisposed() {
    return this._isDisposed;
  }

  constructor(
    stores: Array<Store<any, any[]> | [Store<any, any[]>, () => any]>,
    private _parent: StoresContainer | null,
    private _isGlobal: boolean = false,
  ) {
    stores.forEach((store) => {
      if (Array.isArray(store)) {
        this.register(store[0], store[1]);
      } else {
        this.register(store, () => store());
      }
    });
  }
  register(store: Store<any, any[]>, constr: () => any) {
    const state: StoreState = {
      isResolved: false,
      constr,
    };

    this._stores.set(store, state);

    return state;
  }
  registerCleanup(cleaner: () => void) {
    this._disposers.add(cleaner);
  }
  resolve<T, A extends any[]>(store: Store<T, A>): T {
    let existingStore = this._stores.get(store);

    if (!existingStore) {
      // If we are at the global container, we register the store automatically
      if (this._isGlobal) {
        // @ts-ignore
        this.register(store, () => store());

        return this.resolve(store);
      }

      // If we are at a root container we stop resolving and rather throw an error
      if (!this._parent) {
        throw new Error(
          `The store "${store.name}" is not registered to a StoresProvider`,
        );
      }

      // We resolve up the tree when we have a parent and no store registered
      return this._parent.resolve(store);
    }

    // If we are at the top we register it if not already registered

    // If it is not resolved, we resolve it
    if (!existingStore.isResolved) {
      currentStoresContainer.push(this);
      existingStore = {
        isResolved: true,
        value: existingStore.constr(),
      };
      currentStoresContainer.pop();
      this._stores.set(store, existingStore);
    }

    return existingStore.value;
  }
  clear() {
    this._disposers.forEach((cleaner) => {
      cleaner();
    });

    this._stores = new Map();
  }
  dispose() {
    this.clear();
    this._isDisposed = true;
  }
}

export const globalStoresContainer = new StoresContainer([], null, true);

const context = createContext<StoresContainer | null>(null);

type StoresProviderProps<
  T extends Array<Store<any, any[]> | [Store<any, any>, () => any]>,
> = {
  stores: T;
  children: React.ReactNode;
};

export class StoresProvider<
  T extends Array<Store<any, any[]> | [Store<any, any>, () => any]>,
> extends Component<StoresProviderProps<T>> {
  static contextType = context;
  container!: StoresContainer;

  componentWillUnmount(): void {
    this.container.dispose();
  }
  render(): ReactNode {
    // React can keep the component reference and mount/unmount it multiple times. Because of that
    // we need to ensure to always have a hooks container instantiated when rendering, as it could
    // have been disposed due to an unmount
    if (!this.container || this.container.isDisposed) {
      this.container = new StoresContainer(
        this.props.stores,
        // eslint-disable-next-line
        // @ts-ignore
        this.context,
      );
    }

    return (
      <context.Provider value={this.container}>
        {this.props.children}
      </context.Provider>
    );
  }
}

export function createStoresProvider<
  T extends {
    [name: string]: () => any;
  },
>(stores: T) {
  return function ScopedStoresProvider(
    props: {
      [U in keyof T as T[U] extends () => any ? never : U]: Parameters<T[U]>[0];
    } & { children: React.ReactNode },
  ) {
    return (
      <StoresProvider
        stores={Object.keys(stores).map((storeKey) => {
          if (storeKey in props) {
            return [
              stores[storeKey],
              () =>
                // @ts-ignore
                stores[storeKey](props[storeKey as keyof T]),
            ];
          }

          return stores[storeKey];
        })}
      >
        {props.children}
      </StoresProvider>
    );
  };
}

export function useCleanup(cleaner: () => void) {
  const activeStoresContainer =
    currentStoresContainer[currentStoresContainer.length - 1];

  if (!activeStoresContainer) {
    throw new Error("You are cleaning up in an invalid context");
  }

  activeStoresContainer.registerCleanup(cleaner);
}

export function useStore<T, A extends any[]>(store: Store<T, A>) {
  const activeStoresContainer =
    currentStoresContainer[currentStoresContainer.length - 1];

  if (!activeStoresContainer) {
    const hookContainer = useContext(context) || globalStoresContainer;

    return hookContainer.resolve<T, A>(store);
  }

  return activeStoresContainer.resolve(store);
}
