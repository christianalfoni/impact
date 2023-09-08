import { Component, ReactNode, createContext, useContext } from "react";

const currentStoreContainer: StoreContainer[] = [];

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

class StoreContainer {
  private _stores = new Map<Store<any, any[]>, StoreState>();
  private _disposers = new Set<() => void>();
  private _isDisposed = false;

  get isDisposed() {
    return this._isDisposed;
  }

  constructor(
    stores: Array<Store<any, any[]> | [Store<any, any[]>, () => any]>,
    private _parent: StoreContainer | null,
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
      // If we are at the global container, we register the hook automatically
      if (this._isGlobal) {
        // @ts-ignore
        this.register(store, () => store());

        return this.resolve(store);
      }

      // If we are at a root container we stop resolving and rather throw an error
      if (!this._parent) {
        throw new Error(
          `The store "${store.name}" is not registered to a StoreProvider`,
        );
      }

      // We resolve up the tree when we have a parent and not hook registered
      return this._parent.resolve(store);
    }

    // If we are at the top we register it if not already registered

    // If it is not resolved, we resolve it
    if (!existingStore.isResolved) {
      currentStoreContainer.push(this);
      existingStore = {
        isResolved: true,
        value: existingStore.constr(),
      };
      currentStoreContainer.pop();
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

export const globalStoreContainer = new StoreContainer([], null, true);

const context = createContext<StoreContainer | null>(null);

type StoreProviderProps<
  T extends Array<Store<any, any[]> | [Store<any, any>, () => any]>,
> = {
  stores: T;
  children: React.ReactNode;
};

export class StoresProvider<
  T extends Array<Store<any, any[]> | [Store<any, any>, () => any]>,
> extends Component<StoreProviderProps<T>> {
  static contextType = context;
  state: StoreContainer;
  constructor(
    props: StoreProviderProps<T>,
    context: React.ContextType<React.Context<StoreContainer | null>>,
  ) {
    super(props);
    this.state = new StoreContainer(props.stores, context);
  }
  componentWillUnmount(): void {
    this.state.dispose();
  }
  render(): ReactNode {
    return (
      <context.Provider value={this.state}>
        {this.props.children}
      </context.Provider>
    );
  }
}

export function createStoresProvider<
  T extends {
    [name: string]: (() => any) & { [STORE_REFERENCE]: Store<any, any> };
  },
>(stores: T) {
  return function ScopedStoreProvider(
    props: {
      [U in keyof T as T[U][typeof STORE_REFERENCE] extends () => any
        ? never
        : U]: Parameters<T[U][typeof STORE_REFERENCE]>[0];
    } & { children: React.ReactNode },
  ) {
    return (
      <StoresProvider
        stores={Object.keys(stores).map((storeKey) => {
          if (storeKey in props) {
            return [
              stores[storeKey][STORE_REFERENCE],
              () =>
              // @ts-ignore
                stores[storeKey][STORE_REFERENCE](props[storeKey as keyof T]),
            ];
          }

          return stores[storeKey][STORE_REFERENCE];
        })}
      >
        {props.children}
      </StoresProvider>
    );
  };
}

export function cleanup(cleaner: () => void) {
  const activeStoreContainer =
    currentStoreContainer[currentStoreContainer.length - 1];

  if (!activeStoreContainer) {
    throw new Error("You are cleaning up in an invalid context");
  }

  activeStoreContainer.registerCleanup(cleaner);
}

const STORE_REFERENCE = Symbol("STORE_REFERENCE");

export function createStore<T, A extends any[]>(store: Store<T, A>) {
  const storeRef = () => {
    const activeStoreContainer =
      currentStoreContainer[currentStoreContainer.length - 1];

    if (!activeStoreContainer) {
      const storeContainer = useContext(context) || globalStoreContainer;

      return storeContainer.resolve<T, A>(store);
    }

    return activeStoreContainer.resolve(store);
  };

  storeRef[STORE_REFERENCE] = store;

  return storeRef as (() => T) & {
    [STORE_REFERENCE]: Store<T, A>;
  };
}
