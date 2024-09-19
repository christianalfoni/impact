import {
  createContext,
  createElement,
  FunctionComponent,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

export { createTransformer } from "./transform";

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

const canUseDOM = !!(
  typeof window !== "undefined" &&
  window.document &&
  window.document.createElement
);

export function configureStore(toObservableProp: Converter<any>) {
  return function createStore<
    SP extends NonNullable<unknown>,
    CP extends NonNullable<unknown>,
    T,
  >(store: Store<SP, T>) {
    function useConfigStore(props: any) {
      const parentStoreContainer = useContext(storeContainerContext);
      const childrenRef = useRef<any>();
      const observablePropsRef = useRef<any>();
      const storeContainerRef = useRef<any>();
      const storeRef = useRef<any>(null);

      // @ts-ignore
      // eslint-disable-next-line
      childrenRef.current = props.children;

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
      }, [props]);

      function configureStore() {
        const container = (storeContainerRef.current = new StoreContainer(
          store,
          // eslint-disable-next-line
          // @ts-ignore
          parentStoreContainer,
        ));

        const observableProps = (observablePropsRef.current = {
          get children() {
            return childrenRef.current;
          },
        }) as any;

        for (const key in props) {
          if (key === "children") {
            continue;
          }
          // @ts-ignore
          observableProps[key] = toObservableProp(props[key]);
        }

        for (const key in observableProps) {
          Object.defineProperty(observableProps, key, {
            get: () => {
              return observableProps[key].get();
            },
          });
        }

        resolvingStoreContainers.push(storeContainerRef.current);
        storeRef.current = store(observableProps, cleanup);
        resolvingStoreContainers.pop();

        container.setValue(storeRef.current);
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
        const wrappedComponent = (props: SP & CP) => {
          const { storeContainerRef, configureStore } = useConfigStore(props);

          if (!storeContainerRef.current) {
            configureStore();
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
      storeProvider = (component) => (props: SP & CP) => {
        const [hasResolvedStore, setResolvedStore] = useState(false);
        const { storeContainerRef, configureStore } = useConfigStore(props);

        if (!canUseDOM) {
          throw new Error(
            `The store "${store.name}" has side effects (cleanup). Do not provide it on the server`,
          );
        }

        useEffect(() => {
          if (hasResolvedStore) {
            return () => {
              storeContainerRef.current.cleanup();
            };
          }
        }, [hasResolvedStore]);

        useLayoutEffect(() => {
          if (hasResolvedStore) {
            return;
          }

          configureStore();

          setResolvedStore(true);
        }, [hasResolvedStore]);

        if (!hasResolvedStore) {
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

    return [storeProvider, useStore] as const;
  };
}

function cleanup(cb: () => void) {
  const resolvingStoreContainer = getResolvingStoreContainer();

  if (!resolvingStoreContainer) {
    throw new Error(
      '"onDidMount" can only be used when creating a reactive component',
    );
  }

  resolvingStoreContainer.registerCleanup(cb);
}
