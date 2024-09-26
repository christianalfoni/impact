import {
  createContext,
  createElement,
  FunctionComponent,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  // @ts-ignore
  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
} from "react";

export type DebugEvent =
  | { type: "connected" }
  | {
      type: "state";
      storeContainer: StoreContainer;
      state: Record<string, unknown>;
    }
  | {
      type: "props";
      storeContainer: StoreContainer;
      props: Record<string, unknown>;
    }
  | {
      type: "store_mounted";
      storeContainer: StoreContainer;
      componentRef: any;
    }
  | {
      type: "store_unmounted";
      storeContainer: StoreContainer;
    };

type DebugListener = (event: DebugEvent) => void;

const debugListeners = new Set<DebugListener>();

export function addDebugListener(listener: DebugListener) {
  debugListeners.add(listener);
  return () => {
    debugListeners.delete(listener);
  };
}

// A reactive context container is like an injection container. It is responsible for resolving a reactive context. As reactive contexts
// can resolve other contexts we keep track of the currently resolving reactive context
const resolvingStoreContainers: Array<StoreContainer> = [];

// Identify if we have a resolving reactive context. This allows the global "cleanup" function register cleanups to
// the currently resolving reactive context
export function getResolvingStoreContainer() {
  return resolvingStoreContainers[resolvingStoreContainers.length - 1];
}

// The type for a reactive context, which is just a function with optional props returning whatever
export type Store<P extends Record<string, unknown> | void, T> = (
  props: P,
  cleanup: Cleanup,
) => T;

export type Cleanup = (cb: () => void) => void;

// A reactive context container is created by the ReactiveContextProvider in React. When using the "useReactiveContext" hook it first finds the
// context providing the reactive context container and then resolves the context
class StoreContainer {
  // For obscure reasons (https://github.com/facebook/react/issues/17163#issuecomment-607510381) React will
  // swallow the first error on render and render again. To correctly throw the initial error we keep a reference to it
  _resolvementError?: Error;
  _cleanups = new Set<() => void>();
  _storeValue: any;

  // When constructing the provider for the reactive context we only keep a reference to the
  // context and any parent reactive context container
  constructor(
    public storeRef: Store<any, any>,
    // When the ReactiveContextProvider mounts it uses the React context to find the parent
    // reactive context container
    public parent: StoreContainer | null,
  ) {}
  setValue(value: any) {
    this._storeValue = value;
  }
  getValue() {
    return this._storeValue;
  }
  hasValue() {
    return this._storeValue !== undefined;
  }
  registerCleanup(cleanup: () => void) {
    this._cleanups.add(cleanup);
  }
  hasCleanup() {
    return Boolean(this._cleanups.size);
  }
  resolve<T>(store: Store<any, any>): T {
    // If there is an error resolving the reactive context we throw it
    if (this._resolvementError) {
      throw this._resolvementError;
    }

    // If we are trying to resolve the reactive context this container is responsbile for and
    // it has already been resolved, we return it
    if (store === this.storeRef) {
      return this._storeValue;
    }

    // If the reactive context is not matching this reactive context container and we have a parent, we start resolving the
    // reactive context at the parent instead
    if (this.parent) {
      return this.parent.resolve(store);
    }

    throw new Error(`No provider could be found for ${store?.name}`);
  }
  cleanup() {
    this._cleanups.forEach((cb) => {
      cb();
    });
  }
}

// The context for the reactive contextContainer
const storeContainerContext = createContext<StoreContainer | null>(null);

// @ts-ignore
storeContainerContext.Provider.displayName = "StateProvider";

type Converter<T> = (prop: T) => {
  get(): any;
  set(newProp: T): void;
};

type StoreObserver = (
  storeValue: Record<string, unknown>,
  updateDebugger: (state: Record<string, unknown>) => void,
) => () => void;

const canUseDOM = !!(
  typeof window !== "undefined" &&
  window.document &&
  window.document.createElement
);

const useCurrentComponent = () => {
  return __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner
    ?.current;
};

export function configureStore(
  toObservableProp: Converter<any>,
  observeStore: StoreObserver,
) {
  return function createStore<
    SP extends NonNullable<unknown>,
    CP extends NonNullable<unknown>,
    T,
  >(
    store: Store<SP, T>,
  ): (() => T) & {
    provider: (component: FunctionComponent<CP>) => FunctionComponent<SP & CP>;
  } {
    function useConfigStore(props: any) {
      const parentStoreContainer = useContext(storeContainerContext);
      const observablePropsRef = useRef<any>();
      const storeContainerRef = useRef<any>();
      const storeRef = useRef<any>(null);
      const comp = useCurrentComponent();

      if (debugListeners.size) {
        useEffect(() => {
          debugListeners.forEach((listener) => {
            listener({
              type: "store_mounted",
              storeContainer: storeContainerRef.current,
              componentRef: comp,
            });
          });
          return () => {
            debugListeners.forEach((listener) => {
              listener({
                type: "store_unmounted",
                storeContainer: storeContainerRef.current,
              });
            });
          };
        }, []);
      }

      // Update props
      useLayoutEffect(() => {
        if (!observablePropsRef.current) {
          return;
        }

        for (const key in observablePropsRef.current) {
          if (key === "children") {
            continue;
          }
          // @ts-ignore
          observablePropsRef.current[key].set(props[key]);
        }

        if (debugListeners.size) {
          debugListeners.forEach((listener) => {
            listener({
              type: "props",
              storeContainer: storeContainerRef.current,
              props,
            });
          });
        }
      }, [props]);

      function configureStore() {
        const container = (storeContainerRef.current = new StoreContainer(
          store,
          // eslint-disable-next-line
          // @ts-ignore
          parentStoreContainer,
        ));

        const observableProps = (observablePropsRef.current = {}) as any;
        const storeProps = {} as any;

        for (const key in props) {
          if (key === "children") {
            continue;
          }
          // @ts-ignore
          observableProps[key] = toObservableProp(props[key]);
        }

        for (const key in observableProps) {
          Object.defineProperty(storeProps, key, {
            get: () => {
              return observableProps[key].get();
            },
          });
        }

        resolvingStoreContainers.push(storeContainerRef.current);
        storeRef.current = store(storeProps, cleanup);

        if (
          debugListeners.size &&
          typeof storeRef.current === "object" &&
          storeRef.current !== null
        ) {
          cleanup(
            observeStore(storeRef.current, (state) => {
              debugListeners.forEach((listener) => {
                // Pass the fiber as well
                listener({
                  type: "state",
                  storeContainer: storeContainerRef.current,
                  state,
                });
              });
            }),
          );
        }

        resolvingStoreContainers.pop();

        container.setValue(storeRef.current);

        return container;
      }

      return {
        configureStore,
        observablePropsRef,
        storeContainerRef,
        storeRef,
      };
    }

    const concurrentCompatible = store.length <= 1;

    let storeProvider: (
      component: FunctionComponent<CP>,
    ) => FunctionComponent<SP & CP>;

    if (concurrentCompatible) {
      storeProvider = (component) => {
        const wrappedComponent = function StoreProvider(props: SP & CP) {
          const { storeContainerRef, configureStore } = useConfigStore(props);
          const hmrRef = useRef(store);

          if (!storeContainerRef.current || hmrRef.current !== store) {
            configureStore();
            hmrRef.current = store;
          }

          resolvingStoreContainers.push(storeContainerRef.current);

          const result = createElement(
            storeContainerContext.Provider,
            {
              value: storeContainerRef.current,
            },
            createElement(component, props),
          );
          resolvingStoreContainers.pop();

          return result;
        };

        wrappedComponent.displayName = component.name;

        return wrappedComponent;
      };
    } else {
      // eslint-disable-next-line
      storeProvider = (component) =>
        function StoreProvider(props: SP & CP) {
          const [resolvedStoreCount, setResolvedStoreCount] = useState(0);
          const { storeContainerRef, configureStore } = useConfigStore(props);
          const hmrRef = useRef(store);

          if (!canUseDOM) {
            throw new Error(
              `The store "${store.name}" has side effects (cleanup). Do not provide it on the server`,
            );
          }

          if (hmrRef.current !== store) {
            storeContainerRef.current.cleanup();
            configureStore();
            hmrRef.current = store;
          }

          useLayoutEffect(() => {
            const container = configureStore();

            setResolvedStoreCount((current) => current + 1);

            return () => {
              container.cleanup();
            };
          }, []);

          if (resolvedStoreCount === 0) {
            return null;
          }

          return createElement(
            storeContainerContext.Provider,
            {
              value: storeContainerRef.current,
            },
            createElement(component, props),
          );
        };
    }

    function useStore(): T {
      const resolvingStoreContainer = getResolvingStoreContainer();

      if (resolvingStoreContainer) {
        return resolvingStoreContainer.resolve(store);
      }

      const storeContainer = useContext(storeContainerContext);

      if (!storeContainer) {
        throw new Error("There are no parent reactive components");
      }

      return storeContainer.resolve(store);
    }

    useStore.provider = storeProvider;

    return useStore;
  };
}

function cleanup(cb: () => void) {
  const resolvingStoreContainer = getResolvingStoreContainer();

  if (!resolvingStoreContainer) {
    throw new Error(
      '"cleanup" can only be used when creating a reactive component',
    );
  }

  resolvingStoreContainer.registerCleanup(cb);
}
