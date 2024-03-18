import {
  Component,
  ReactNode,
  createContext,
  useContext,
  // @ts-ignore-next-line
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED as ReactInternals,
  createElement,
} from "react";
import type { useReducer, useEffect } from "react";

const currentStoreContainer: StoreContainer[] = [];
const registeredProvidedStores = new Set<Store<any, any>>();

export function getActiveStoreContainer() {
  return currentStoreContainer[currentStoreContainer.length - 1];
}

export type Store<T, A extends Record<string, unknown> | void> = (
  props: A,
) => T;

export type StoreState =
  | {
      isResolved: true;
      value: any;
      ref: Store<any, any>;
    }
  | {
      isResolved: false;
      constr: () => any;
      ref: Store<any, any>;
    };

class StoreContainer {
  // For obscure reasons (https://github.com/facebook/react/issues/17163#issuecomment-607510381) React will
  // swallow the first error on render and render again. To correctly throw the initial error we keep a reference to it
  private _resolvementError?: Error;
  private _state: StoreState;
  private _disposers = new Set<() => void>();
  private _isDisposed = false;

  get isDisposed() {
    return this._isDisposed;
  }

  constructor(
    ref: Store<any, any>,
    constr: () => any,
    private _parent: StoreContainer | null,
  ) {
    this._state = {
      isResolved: false,
      ref,
      constr,
    };
  }
  registerCleanup(cleaner: () => void) {
    this._disposers.add(cleaner);
  }
  resolve<T, A extends Record<string, unknown> | void>(store: Store<T, A>): T {
    if (this._resolvementError) {
      throw this._resolvementError;
    }

    if (this._state.isResolved && store === this._state.ref) {
      return this._state.value;
    }

    if (!this._state.isResolved && this._state.ref === store) {
      try {
        currentStoreContainer.push(this);
        this._state = {
          isResolved: true,
          value: this._state.constr(),
          ref: store,
        };
        currentStoreContainer.pop();

        return this._state.value;
      } catch (e) {
        this._resolvementError =
          new Error(`Could not initialize store "${store?.name}":
${String(e)}`);
        throw this._resolvementError;
      }
    }

    if (this._parent) {
      return this._parent.resolve(store);
    }

    let resolvedStore = globalStores.get(store);

    if (!resolvedStore && registeredProvidedStores.has(store)) {
      throw new Error(
        `The store ${store.name} should be provided on a context, but no provider was found`,
      );
    }

    if (!resolvedStore) {
      // @ts-ignore
      resolvedStore = store();
      globalStores.set(store, resolvedStore);
    }

    return resolvedStore;
  }
  clear() {
    this._disposers.forEach((cleaner) => {
      cleaner();
    });
  }
  dispose() {
    this.clear();
    this._isDisposed = true;
  }
}

const storeContainerContext = createContext<StoreContainer | null>(null);

export class StoreContainerProvider<
  T extends Record<string, unknown> | void,
> extends Component<{
  store: Store<any, any>;
  props: T;
  children: React.ReactNode;
}> {
  static contextType = storeContainerContext;
  container!: StoreContainer;
  componentWillUnmount(): void {
    this.container.dispose();
  }
  render(): ReactNode {
    // React can keep the component reference and mount/unmount it multiple times. Because of that
    // we need to ensure to always have a hooks container instantiated when rendering, as it could
    // have been disposed due to an unmount
    if (!this.container || this.container.isDisposed) {
      this.container = new StoreContainer(
        this.props.store,
        () => this.props.store(this.props.props),
        // eslint-disable-next-line
        // @ts-ignore
        this.context,
      );
    }

    return createElement(
      storeContainerContext.Provider,
      {
        value: this.container,
      },
      this.props.children,
    );
  }
}

export function cleanup(cleaner: () => void) {
  const activeStoreContainer = getActiveStoreContainer();

  // We do not want to clean up if we are not in a context, which
  // means we are just globally running the store
  if (!activeStoreContainer) {
    return;
  }

  activeStoreContainer.registerCleanup(cleaner);
}

export const componentConsumptionHooks = {
  isConsuming: false,
  onConsume: () => {},
  onConsumed: () => {},
};

const globalStores = new Map<Store<any, any>, any>();

export function useStore<T, A extends Record<string, unknown> | void>(
  store: Store<T, A>,
): T {
  const activeStoreContainer = getActiveStoreContainer();

  if (!activeStoreContainer) {
    if (!componentConsumptionHooks.isConsuming) {
      componentConsumptionHooks.isConsuming = true;
      componentConsumptionHooks.onConsume();
    }

    const storeContainer = useContext(storeContainerContext);

    if (!storeContainer) {
      let resolvedStore = globalStores.get(store);

      if (!resolvedStore && registeredProvidedStores.has(store)) {
        throw new Error(
          `The store ${store.name} should be provided on a context, but no provider was found`,
        );
      }

      if (!resolvedStore) {
        // @ts-ignore
        resolvedStore = store();
        globalStores.set(store, resolvedStore);
      }

      return resolvedStore;
    }

    return storeContainer.resolve<T, A>(store);
  }

  return activeStoreContainer.resolve(store);
}

export function createStoreProvider<
  T,
  A extends Record<string, unknown> | void,
>(store: Store<T, A>) {
  registeredProvidedStores.add(store);
  const StoreProvider = (props: A & { children: React.ReactNode }) => {
    // To avoid TSLIB
    const extendedProps = Object.assign({}, props);
    const children = extendedProps.children;

    delete extendedProps.children;

    return createElement(
      StoreContainerProvider,
      // @ts-ignore
      {
        props: extendedProps,
        store,
      },
      children,
    );
  };

  StoreProvider.displayName = store.name
    ? `${store.name}Provider`
    : "AnonymousStoreProvider";

  StoreProvider.provide = (component: React.FC<A>) => {
    return (props: A) => {
      return createElement(
        StoreProvider,
        // @ts-ignore
        props,
        // @ts-ignore
        createElement(component, props),
      );
    };
  };

  return StoreProvider;
}

interface ReactDispatcher {
  useReducer: typeof useReducer;
  useEffect: typeof useEffect;
}

if (typeof window !== "undefined") {
  let currentDispatcher: ReactDispatcher | null = null;

  Object.defineProperty(ReactInternals.ReactCurrentDispatcher, "current", {
    get() {
      return currentDispatcher;
    },
    set(nextDispatcher: ReactDispatcher) {
      currentDispatcher = nextDispatcher;

      if (
        componentConsumptionHooks.isConsuming &&
        // When the hooks has the same implementation, it is to throw an error, meaning
        // we are done consuming a hooks context
        currentDispatcher.useReducer === currentDispatcher.useEffect
      ) {
        componentConsumptionHooks.isConsuming = false;
        componentConsumptionHooks.onConsumed();
      }
    },
  });
}
