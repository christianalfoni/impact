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

export type StoreReference = {
  id: string;
  name: string;
  parent?: StoreReference;
};

export type DebugEvent =
  | {
      type: "init";
    }
  | {
      type: "state";
      storeReference: StoreReference;
      state: Record<string, unknown>;
    }
  | {
      type: "props";
      storeReference: StoreReference;
      props: Record<string, unknown>;
    }
  | {
      type: "store_mounted";
      storeReference: StoreReference;
    }
  | {
      type: "store_unmounted";
      storeReference: StoreReference;
    };

export type DebugMessage =
  | {
      type: "ready";
    }
  | {
      type: "initialised";
    }
  | {
      type: "highlight-store";
      data: { id: string };
    }
  | {
      type: "highlight-clean";
      data: undefined;
    };

function isImpactDebuggerMessage(event: MessageEvent): event is MessageEvent<{
  source: "IMPACT_DEBUGGER";
  message: DebugMessage;
}> {
  return event.data && event.data.source === "IMPACT_DEBUGGER";
}

let sendDebugMessage: (event: DebugEvent) => void | undefined;
const storeNodeReferences: Record<
  string,
  {
    node: HTMLElement | null;
    name: string;
  }
> = {};

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  let _resolveDebuggerReady: () => void;
  let debuggerReadyBarrier = new Promise<void>((resolve) => {
    _resolveDebuggerReady = resolve;
  });

  const sendMessage = (message: DebugEvent) =>
    window.postMessage({ type: "IMPACT_DEBUG_MESSAGE", message }, "*");

  sendDebugMessage = (message) => {
    debuggerReadyBarrier = debuggerReadyBarrier.then(() =>
      sendMessage(message),
    );
  };

  sendMessage({
    type: "init",
  });

  window.addEventListener("message", (event) => {
    if (isImpactDebuggerMessage(event)) {
      console.log(event.data.message);
      switch (event.data.message.type) {
        case "ready": {
          // Debugger might open after we have init
          sendMessage({
            type: "init",
          });
          break;
        }
        case "initialised": {
          _resolveDebuggerReady();
          break;
        }
        case "highlight-store": {
          const storeNodeReference =
            storeNodeReferences[event.data.message.data.id];

          if (!storeNodeReference) {
            return;
          }

          // @ts-ignore
          const reactFiberId = // @ts-ignore
            window.__REACT_DEVTOOLS_GLOBAL_HOOK__?.rendererInterfaces
              ?.get(1)
              ?.getFiberIDForNative(storeNodeReference.node);
          window.postMessage({
            source: "react-devtools-content-script",
            payload: {
              event: "highlightNativeElement",
              payload: {
                displayName: storeNodeReference.name,
                hideAfterTimeout: false,
                id: reactFiberId,
                openNativeElementsPanel: false,
                rendererID: 1,
                scrollIntoView: false,
              },
            },
          });
          break;
        }
        case "highlight-clean": {
          window.postMessage({
            source: "react-devtools-content-script",
            payload: {
              event: "clearNativeElementHighlight",
            },
          });
          break;
        }
      }
    }
  });
}

function createUniqueId() {
  return Math.random().toString(36).substring(2, 15);
}

function findStateNode(componentRef: any): HTMLElement | null {
  if (componentRef.stateNode) {
    return componentRef.stateNode;
  }

  return findStateNode(componentRef.return);
}

const storeReferences = new Map<StoreContainer, StoreReference>();

function resolveStoreReference(storeContainer: StoreContainer): StoreReference {
  let storeReference = storeReferences.get(storeContainer);

  if (storeReference) {
    return storeReference;
  }

  storeReference = {
    id: createUniqueId(),
    name: storeContainer.name,
    parent: storeContainer.parent
      ? resolveStoreReference(storeContainer.parent)
      : undefined,
  };

  storeReferences.set(storeContainer, storeReference);

  return storeReference;
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
  _injectionValues: Record<symbol, any> = {};

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
  addInjectionValue(symbol: symbol, value: any) {
    this._injectionValues[symbol] = value;
  }
  getInjectionValue(symbol: symbol) {
    return this._injectionValues[symbol];
  }
  hasInjectionValue(symbol: symbol) {
    return symbol in this._injectionValues;
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

      if (sendDebugMessage) {
        useEffect(() => {
          const storeReference = resolveStoreReference(storeContextRef.current);

          sendDebugMessage({
            type: "store_mounted",
            storeReference,
          });

          const node = findStateNode(comp);

          storeNodeReferences[storeReference.id] = {
            node,
            name: storeReference.name,
          };

          let disposeObserveStore: (() => void) | undefined;

          if (
            typeof storeRef.current === "object" &&
            storeRef.current !== null
          ) {
            disposeObserveStore = observeStore(storeRef.current, (state) => {
              sendDebugMessage({
                type: "state",
                storeReference: resolveStoreReference(storeContextRef.current),
                state,
              });
            });
          }

          return () => {
            sendDebugMessage({
              type: "store_unmounted",
              storeReference: resolveStoreReference(storeContextRef.current),
            });

            storeReferences.delete(storeContextRef.current);
            delete storeNodeReferences[storeReference.id];

            disposeObserveStore?.();
          };
        }, []);
      }

      // Update props
      useEffect(() => {
        if (sendDebugMessage) {
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

          sendDebugMessage({
            type: "props",
            storeReference: resolveStoreReference(storeContextRef.current),
            props: {
              ...props,
              children: undefined,
            },
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

        if (sendDebugMessage) {
          sendDebugMessage({
            type: "props",
            storeReference: resolveStoreReference(storeContextRef.current),
            props: {
              ...props,
              children: undefined,
            },
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
    useStore.provider = (component: any) => (props: any) =>
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

export function createStoreValue<T>(): {
  (): T;
  (value: T): void;
} {
  const symbol = Symbol();

  function resolveValue(storeContainer: StoreContainer) {
    if (storeContainer.hasInjectionValue(symbol)) {
      return storeContainer.getInjectionValue(symbol);
    }

    if (!storeContainer.parent) {
      throw new Error("The value is not provided by any store");
    }

    return resolveValue(storeContainer.parent);
  }

  return function (...args: [] | [T]) {
    const resolvingStoreContainer = getResolvingStoreContainer();

    if (!resolvingStoreContainer) {
      throw new Error("You can not inject store values outside a store");
    }

    if (!args.length) {
      return resolveValue(resolvingStoreContainer);
    }

    resolvingStoreContainer.addInjectionValue(symbol, args[0]);
  };
}
