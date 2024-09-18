import {
  createContext,
  createElement,
  FunctionComponent,
  ReactNode,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

// A reactive context container is like an injection container. It is responsible for resolving a reactive context. As reactive contexts
// can resolve other contexts we keep track of the currently resolving reactive context
const resolvingStoreContainers: Array<StoreContainer> = [];

// Identify if we have a resolving reactive context. This allows the global "cleanup" function register cleanups to
// the currently resolving reactive context
export function getResolvingStoreContainer() {
  return resolvingStoreContainers[resolvingStoreContainers.length - 1];
}

export type StoreContext = {
  onDidMount(cb: () => void): void;
  onWillUnmount(cb: () => void): void;
};

// The type for a reactive context, which is just a function with optional props returning whatever
export type Store<P extends Record<string, unknown> | void, T> = (
  props: P,
  storeContext: StoreContext,
) => T;

export type Render<P extends Record<string, unknown> | void> = (
  props: P,
) => ReactNode;

// A reactive context container is created by the ReactiveContextProvider in React. When using the "useReactiveContext" hook it first finds the
// context providing the reactive context container and then resolves the context
class StoreContainer {
  // For obscure reasons (https://github.com/facebook/react/issues/17163#issuecomment-607510381) React will
  // swallow the first error on render and render again. To correctly throw the initial error we keep a reference to it
  _resolvementError?: Error;
  _onWillUnmounts = new Set<() => void>();
  _onDidMounts = new Set<() => void>();
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
  registerOnUnmount(unMounter: () => void) {
    this._onWillUnmounts.add(unMounter);
  }
  registerOnMount(mounter: () => void) {
    this._onDidMounts.add(mounter);
  }
  hasCleanup() {
    return Boolean(this._onWillUnmounts.size);
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
  willUnmount() {
    this._onWillUnmounts.forEach((cb) => {
      cb();
    });
  }
  didMount() {
    this._onDidMounts.forEach((cb) => {
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

export function useStore<S>(store: Store<any, S>): S {
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

export type ComponentOptions = {
  concurrent?: boolean;
  provideStore?: boolean;
};

export function configureComponent(
  toObservableProp: Converter<any>,
  observer: <T extends NonNullable<unknown>>(
    cb: FunctionComponent<T>,
  ) => FunctionComponent<T>,
) {
  return function createComponent<
    SP extends NonNullable<unknown>,
    CP extends NonNullable<unknown>,
  >(
    store: Store<SP, any>,
    render: Render<CP>,
    { concurrent = true, provideStore = true }: ComponentOptions = {},
  ) {
    const ReactiveComponent = observer((props: SP & CP) => {
      const [isBlocking, setBlocking] = useState(false);
      const parentStoreContainer = useContext(storeContainerContext);
      const childrenRef = useRef<any>();
      const observablePropsRef = useRef<any>();
      const storeContainerRef = useRef<any>();
      const storeRef = useRef<any>(null);

      // @ts-ignore
      // eslint-disable-next-line
      childrenRef.current = props.children;

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
        storeRef.current = store(observableProps, {
          onDidMount,
          onWillUnmount,
        });
        resolvingStoreContainers.pop();

        container.setValue(storeRef.current);
      }

      function renderUi() {
        resolvingStoreContainers.push(storeContainerRef.current);

        const result = render(observablePropsRef.current);

        resolvingStoreContainers.pop();

        if (provideStore) {
          return createElement(
            storeContainerContext.Provider,
            {
              value: storeContainerRef.current,
            },
            result,
          );
        }

        return result;
      }

      useEffect(() => {
        if (isBlocking) {
          storeContainerRef.current.didMount();

          return () => {
            storeContainerRef.current.willUnmount();
          };
        }
      }, [isBlocking]);

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

      useLayoutEffect(() => {
        if (observablePropsRef.current) {
          return;
        }

        configureStore();

        setBlocking(true);
      }, []);

      if (canUseDOM && concurrent && !storeRef.current) {
        configureStore();
      }

      // Any other render on client in risk of concurrent issues
      if (canUseDOM) {
        return renderUi();
      }

      // SSR
      resolvingStoreContainers.push(storeContainerRef.current);

      const ui = store(props, {
        onDidMount() {},
        onWillUnmount() {},
      });

      resolvingStoreContainers.pop();

      return ui;
    });

    // @ts-ignore
    ReactiveComponent.displayName = store.name;

    return ReactiveComponent;
  };
}

export function onDidMount(cb: () => void) {
  const resolvingStoreContainer = getResolvingStoreContainer();

  if (!resolvingStoreContainer) {
    throw new Error(
      '"onDidMount" can only be used when creating a reactive component',
    );
  }

  resolvingStoreContainer.registerOnMount(cb);
}

export function onWillUnmount(cb: () => void) {
  const resolvingStoreContainer = getResolvingStoreContainer();

  if (!resolvingStoreContainer) {
    throw new Error(
      '"onDidMount" can only be used when creating a reactive component',
    );
  }

  resolvingStoreContainer.registerOnUnmount(cb);
}
