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
  ReactNode,
} from "react";

export type SerializedStore = {
  id: string;
  name: string;
  parent?: SerializedStore;
};

export type DebugEvent =
  | { type: "connected" }
  | {
      type: "state";
      storeContext: StoreContainer;
      state: Record<string, unknown>;
    }
  | {
      type: "state_debugger"; // TODO: find a better name
      storeRefId: SerializedStore["id"];
      state: Record<string, unknown>;
    }
  | {
      type: "props";
      storeContext: StoreContainer;
      props: Record<string, unknown>;
    }
  | {
      type: "props_debugger"; // TODO: find a better name
      storeRefId: SerializedStore["id"];
      props: Record<string, unknown>;
    }
  | {
      type: "store_mounted";
      storeContext: StoreContainer;
      componentRef: any;
    }
  | {
      type: "store_mounted_debugger"; // TODO: find a better name
      reactFiberId: number;
      store: SerializedStore;
    }
  | {
      type: "store_unmounted";
      storeContext: StoreContainer;
    }
  | {
      type: "store_unmounted_debugger"; // TODO: find a better name
      storeRefId: SerializedStore["id"];
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
export class StoreContainer {
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
    public name: string,
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
const storeContext = createContext<StoreContainer | null>(null);

// @ts-ignore
storeContext.Provider.displayName = "StateProvider";

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
    SP extends Record<string, unknown>,
    CP extends Record<string, unknown>,
    T,
  >(
    store: Store<SP, T>,
  ): (() => T) & {
    Provider: FunctionComponent<SP & { children: ReactNode }>;
    /**
     * Please use the .Provider instead
     * @deprecated
     */
    provider: (
      component: (props: CP) => ReactNode,
    ) => FunctionComponent<SP & CP & { children: ReactNode }>;
  } {
    function useConfigStore(props: any) {
      const parentStoreContext = useContext(storeContext);
      const observablePropsRef = useRef<any>();
      const storeContextRef = useRef<any>();
      const storeRef = useRef<any>(null);
      const comp = useCurrentComponent();
      const prevPropsRef = useRef<any>(props);

      if (debugListeners.size) {
        useEffect(() => {
          debugListeners.forEach((listener) => {
            listener({
              type: "store_mounted",
              // TODO: consider another name for `container`
              storeContext: storeContextRef.current,
              componentRef: comp,
            });
          });

          let disposeObserveStore;

          if (
            typeof storeRef.current === "object" &&
            storeRef.current !== null
          ) {
            disposeObserveStore = observeStore(storeRef.current, (state) => {
              debugListeners.forEach((listener) => {
                listener({
                  type: "state",
                  storeContext: storeContextRef.current,
                  state,
                });
              });
            });
          }

          return () => {
            debugListeners.forEach((listener) => {
              listener({
                type: "store_unmounted",
                storeContext: storeContextRef.current,
              });
            });

            disposeObserveStore?.();
          };
        }, []);
      }

      // Update props
      useEffect(() => {
        if (debugListeners.size) {
          let hasChangedProps = false;

          for (const key in props) {
            if (props[key] !== prevPropsRef.current[key]) {
              hasChangedProps = true;
              break;
            }
          }

          prevPropsRef.current = props;

          if (!hasChangedProps) {
            return;
          }

          debugListeners.forEach((listener) => {
            listener({
              type: "props",
              storeContext: storeContextRef.current,
              props,
            });
          });
        }
      }, [props]);

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
              storeContext: storeContextRef.current,
              props,
            });
          });
        }
      }, [props]);

      function configureStore() {
        const container = (storeContextRef.current = new StoreContainer(
          store,
          // eslint-disable-next-line
          // @ts-ignore
          parentStoreContext,
          store.name,
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

        resolvingStoreContainers.push(storeContextRef.current);
        storeRef.current = store(storeProps, cleanup);

        resolvingStoreContainers.pop();

        container.setValue(storeRef.current);

        return container;
      }

      return {
        configureStore,
        observablePropsRef,
        storeContainerRef: storeContextRef,
        storeRef,
      };
    }

    const concurrentCompatible = store.length <= 1;

    let StoreProvider: FunctionComponent<SP & { children: ReactNode }>;

    if (concurrentCompatible) {
      StoreProvider = function StoreProvider(props) {
        const { storeContainerRef, configureStore } = useConfigStore(props);
        const hmrRef = useRef(store);

        if (!storeContainerRef.current || hmrRef.current !== store) {
          configureStore();
          hmrRef.current = store;
        }

        resolvingStoreContainers.push(storeContainerRef.current);

        const result = createElement(
          storeContext.Provider,
          {
            value: storeContainerRef.current,
          },
          props.children,
        );
        resolvingStoreContainers.pop();

        return result;
      };
    } else {
      StoreProvider = function StoreProvider(props) {
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
          storeContext.Provider,
          {
            value: storeContainerRef.current,
          },
          // eslint-disable-next-line
          props.children,
        );
      };
    }

    StoreProvider.displayName = store.name;

    function useStore(): T {
      const resolvingStoreContainer = getResolvingStoreContainer();

      if (resolvingStoreContainer) {
        return resolvingStoreContainer.resolve(store);
      }

      const storeContainer = useContext(storeContext);

      if (!storeContainer) {
        throw new Error("There are no parent reactive components");
      }

      return storeContainer.resolve(store);
    }

    useStore.Provider = StoreProvider;
    useStore.provider = (component) => (props) =>
      createElement(StoreProvider, props, component(props));

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
