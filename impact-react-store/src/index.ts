import React, {
  Component,
  createContext,
  createElement,
  ReactNode,
  Suspense,
  useContext,
} from "react";

// Polyfill this symbol as Safari currently does not have it
// @ts-ignore
Symbol.dispose ??= Symbol("Symbol.dispose");

export type ObserverContextType = "component" | "derived" | "effect";

const isProduction =
  typeof process !== "undefined" && process.env.NODE_ENV === "production";

// A store container is like an injection container. It is responsible for resolving stores. As stores can resolve
// other stores we keep track of the currently resolving stores
const resolvingStoreContainers: Array<StoreContainer> = [];

// We use a global reference to the resolved events of "receiver". This allows us
// to attach the resolved events to the global store or the store container
let lastProvidedStoreContext: any;

// In development mode we want to throw an error if you use React hooks inside the store. We do that by
// creating a globally controlled React dispatcher blocker
let blockableDispatcher: any;
let isBlockingDispatcher = false;
const dispatchUnblocker = () => {
  isBlockingDispatcher = false;
};

// This is only used in development
function blockDispatcher() {
  isBlockingDispatcher = true;

  if (blockableDispatcher) {
    return dispatchUnblocker;
  }

  // React allows access to its internals during development
  const internals =
    // @ts-ignore
    React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED ||
    // @ts-ignore
    React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;

  // TODO: Verify the dispatcher of React 19, is it consistently on H?
  const dispatcher = internals.ReactCurrentDispatcher?.current ?? internals.H;

  // If for some reason React changes its internals
  if (!dispatcher) {
    console.warn(
      "Unable to warn about invalid hooks usage in Stores, please create an issue",
    );

    return () => {};
  }

  // There are different dispatchers in React, but when this function is called
  // the active dispatcher is the one that allows hooks to be called. We only
  // need to override it once
  if (!blockableDispatcher) {
    for (const key in dispatcher) {
      const originHook = dispatcher[key];
      dispatcher[key] = (...args: any[]) => {
        if (isBlockingDispatcher) {
          throw new Error("You can not use React hooks inside stores");
        }

        return originHook.apply(dispatcher, args);
      };
    }

    blockableDispatcher = dispatcher;
  }

  return dispatchUnblocker;
}

// Identify if we have a resolving store. This allows the global "cleanup" function register cleanups to
// the currently resolving store
export function getResolvingStoreContainer() {
  return resolvingStoreContainers[resolvingStoreContainers.length - 1];
}

// The type for store, which is just a function with optional props returning an object
export type Store<
  T extends Record<string, unknown>,
  A extends Record<string, unknown> | void,
> = (props: A) => T;

// We keep track of the resolved state of a store
export type StoreState =
  | {
      isResolved: true;
      store: any;
      storeRef: Store<any, any>;
    }
  | {
      isResolved: false;
      // The constructor is not the store itself, but a function created
      // by StoreProvider which includes the props
      storeConstr: () => any;
      storeRef: Store<any, any>;
    };

// A store container is created by the StoreProvider in React. When using the "useStore" hook it first finds the
// context providing the store container and then resolves the store
class StoreContainer {
  // For obscure reasons (https://github.com/facebook/react/issues/17163#issuecomment-607510381) React will
  // swallow the first error on render and render again. To correctly throw the initial error we keep a reference to it
  _resolvementError?: Error;
  _state: StoreState;
  _disposers = new Set<() => void>();
  // The RPC events registered with "receiver"
  injectionContext: any;

  // When constructing the provider for the store we only keep a reference to the store and
  // any parent store container
  constructor(
    storeRef: Store<any, any>,
    constr: () => any,
    // When the StoreProvider mounts it uses the React context to find the parent
    // store container
    public parent: StoreContainer | null,
  ) {
    this._state = {
      isResolved: false,
      storeRef,
      storeConstr: constr,
    };
  }
  // When resolving the store we use a global "cleanup" function which accesses the currently resolving store
  // and registers the cleanup function
  registerCleanup(cleaner: () => void) {
    this._disposers.add(cleaner);
  }
  resolve<
    T extends Record<string, unknown>,
    A extends Record<string, unknown> | void,
  >(store: Store<T, A>): T {
    // If there is an error resolving the store we throw it
    if (this._resolvementError) {
      throw this._resolvementError;
    }

    // If we are trying to resolve the store this container is responsbile for and
    // it has already been resolved, we return it
    if (this._state.isResolved && store === this._state.storeRef) {
      return this._state.store;
    }

    // If we are trying to resolve the store this container is responsible for and
    // it has NOT been resolved, we resolve it
    if (!this._state.isResolved && this._state.storeRef === store) {
      try {
        // We push to our global tracking of resolvement
        resolvingStoreContainers.push(this);
        // We resolve simply by calling the constructor
        this._state = {
          isResolved: true,
          store: this._state.storeConstr(),
          storeRef: store,
        };
        // We have called the store and events might have been registered with "receiver"
        this.injectionContext = lastProvidedStoreContext;
        lastProvidedStoreContext = undefined;
        // We pop off the resolvement tracker
        resolvingStoreContainers.pop();

        return this._state.store;
      } catch (e) {
        // See comment on why we need to do this
        this._resolvementError =
          new Error(`Could not initialize store "${store?.name}":
${String(e)}`);
        throw this._resolvementError;
      }
    }

    // If the store is not matching this store container and we have a parent, we start resolving the
    // store at the parent instead
    if (this.parent) {
      return this.parent.resolve(store);
    }

    throw new Error(`No provider could be found for ${store?.name}`);
  }
  cleanup() {
    this._disposers.forEach((cleaner) => {
      cleaner();
    });
  }
}

// The context for the StoreContainer
const storeContainerContext = createContext<StoreContainer | null>(null);

// We allow running this "cleanup" function globally. It uses the
// currently resolving container to register the cleanup function
export function cleanup(cleaner: () => void) {
  const resolvingStoreContainer = getResolvingStoreContainer();

  if (!resolvingStoreContainer) {
    throw new Error('"cleanup" can only be used when creating a store');
  }

  resolvingStoreContainer.registerCleanup(cleaner);
}

// "useStore" can be used in both components and stores. When resolving from a component
// it will create an observer context and resolve the store. If resolving from a store it will
// only resolve the store
function useStore<
  T extends Record<string, unknown>,
  A extends Record<string, unknown> | void,
>(store: Store<T, A>): T {
  const resolvingStoreContainer = getResolvingStoreContainer();

  // If we are not currently resolving a store, we assume that we are resolving from a component as
  // you can really only initiate resolving stores from components
  if (!resolvingStoreContainer) {
    // We try to find a store container on the context first, to resolve a store from it
    const storeContainer = useContext(storeContainerContext);

    if (storeContainer && !isProduction) {
      const unblockDispatcher = blockDispatcher();
      try {
        return storeContainer.resolve<T, A>(store);
      } finally {
        unblockDispatcher();
      }
    }

    if (storeContainer) {
      return storeContainer.resolve<T, A>(store);
    }

    throw new Error(`No provider could be found for ${store?.name}`);
  }

  // At this point we are not in a component and we resolve the store as normal
  return resolvingStoreContainer.resolve(store);
}

// This function creates the actual hook and related StoreProvider component, which is responsible for converting
// props into signals and keep them up to date. Also isolate the children in this component, as
// those are not needed in the store
export function createStore<
  T extends Record<string, unknown>,
  A extends Record<string, any> | void,
  U extends Record<string, any>,
  K extends Record<string, any>,
>(
  store: Store<T, K>,
  createObservableProps: (props: Record<string, any>) => U,
  updateObservableProps: (
    props: Record<string, any>,
    observableProps: NoInfer<U>,
  ) => void,
  provideObservableProps: (props: NoInfer<U>) => K,
): (() => T) & {
  Provider: React.ComponentClass<
    A extends void
      ? { children: React.ReactNode }
      : A & { children: React.ReactNode }
  >;
} {
  // The StoreProvider provides the store container which resolves the store. We use a class because
  // we need the "componentWillUnmount" lifecycle hook
  class StoreProvider extends Component {
    static displayName = store.name
      ? `${store.name}Provider`
      : "AnonymousStoreProvider";
    static contextType = storeContainerContext;
    // We need to track the mounted state, as StrictMode will call componentDidMount
    // and componentWillUnmount twice, meaning we'll cleanup too early. These are safeguards
    // for some common misuse of Reacts primitives. But here we know what we are doing. We
    // want to instantiate the StoreContainer immediately so it is part of the rendering
    // of the children and clean it up when this component unmounts
    mounted = false;
    // We convert props into signals
    observableProps: any = createObservableProps(this.props);
    storeConstructor = () => {
      return store(provideObservableProps(this.observableProps));
    };
    container = new StoreContainer(
      store,
      this.storeConstructor,
      // eslint-disable-next-line
      // @ts-ignore
      this.context,
    );
    componentDidMount(): void {
      this.mounted = true;
    }
    componentDidUpdate() {
      updateObservableProps(this.props, this.observableProps);
    }
    // When an error is thrown we dispose of the store. Then we throw the error up the component tree.
    // This ensures that an error thrown during render phase does not keep any subscriptions etc. going.
    // Recovering from the error in a parent error boundary will cause a new store to be created. Developers
    // can still add nested error boundaries to control recoverable state
    componentDidCatch(error: Error): void {
      this.container.cleanup();
      this.container = new StoreContainer(
        store,
        this.storeConstructor,
        // eslint-disable-next-line
        // @ts-ignore
        this.context,
      );
      throw error;
    }
    componentWillUnmount(): void {
      this.mounted = false;
      Promise.resolve().then(() => {
        if (!this.mounted) {
          this.container.cleanup();
        }
      });
    }
    render(): ReactNode {
      return createElement(
        storeContainerContext.Provider,
        {
          value: this.container,
        },
        // We create a Suspense boundary for the store to throw an error of misuse. StoreProviders does not support
        // suspense because they will be-reinstantiated or can risk not cleaning up as the parent Suspense boundary
        // is unmounted and the "componentWillUnmount" will never be called. In practice it does not make sense
        // to have these parent suspense boundaries, but just to help out
        createElement(
          Suspense,
          {
            fallback: createElement(() => {
              throw new Error(
                "The StoreProvider does not support suspense. Please add a Suspense boundary between the StoreProvider and the components using suspense",
              );
            }),
          },
          // @ts-ignore
          // eslint-disable-next-line
          this.props.children,
        ),
      );
    }
  }

  const hook = () => useStore(store);

  hook.Provider = StoreProvider;

  return hook as any;
}

export function context<T extends Record<string, any>>(): T;
export function context<T extends Record<string, any>>(context: T): void;
export function context<T extends Record<string, any>>(context?: T) {
  const storeContainer = getResolvingStoreContainer();

  if (!storeContainer) {
    throw new Error('Can not call "context" outside a store');
  }

  if (context) {
    lastProvidedStoreContext = context;

    return;
  }

  return new Proxy(
    {},
    {
      get(_, injectKey: string) {
        let currentStoreContainer = storeContainer;
        while (currentStoreContainer) {
          if (currentStoreContainer.injectionContext?.[injectKey]) {
            return currentStoreContainer.injectionContext[injectKey];
          }

          if (currentStoreContainer.parent) {
            currentStoreContainer = currentStoreContainer.parent;
            continue;
          }

          throw new Error(
            "There are no providers for the injection context: " + injectKey,
          );
        }
      },
    },
  ) as T;
}
