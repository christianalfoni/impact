import React, {
  Component,
  createContext,
  createElement,
  memo,
  MutableRefObject,
  ReactNode,
  Ref,
  Suspense,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

// Polyfill this symbol as Safari currently does not have it
// @ts-ignore
Symbol.dispose ??= Symbol("Symbol.dispose");

const isProduction =
  typeof process !== "undefined" && process.env.NODE_ENV === "production";

// A reactive context container is like an injection container. It is responsible for resolving a reactive context. As reactive contexts
// can resolve other contexts we keep track of the currently resolving reactive context
const resolvingReactiveContextContainers: Array<ReactiveContextContainer> = [];

// In development mode we want to throw an error if you use React hooks inside the reactive context. We do that by
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
      "Unable to warn about invalid hooks usage in reactive contexts, please create an issue",
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
          throw new Error(
            "You can not use React hooks inside reactive contexts",
          );
        }

        return originHook.apply(dispatcher, args);
      };
    }

    blockableDispatcher = dispatcher;
  }

  return dispatchUnblocker;
}

// Identify if we have a resolving reactive context. This allows the global "cleanup" function register cleanups to
// the currently resolving reactive context
export function getResolvingReactiveContextContainer() {
  return resolvingReactiveContextContainers[
    resolvingReactiveContextContainers.length - 1
  ];
}

export type SetupContext = {
  onDidMount(cb: () => void): void;
  onWillUnmount(cb: () => void): void;
};

// The type for a reactive context, which is just a function with optional props returning whatever
export type ReactiveComponent<P extends Record<string, unknown> | void> = (
  props: P,
  setupContext: SetupContext,
) => () => ReactNode;

// A reactive context container is created by the ReactiveContextProvider in React. When using the "useReactiveContext" hook it first finds the
// context providing the reactive context container and then resolves the context
class ReactiveContextContainer {
  // For obscure reasons (https://github.com/facebook/react/issues/17163#issuecomment-607510381) React will
  // swallow the first error on render and render again. To correctly throw the initial error we keep a reference to it
  _resolvementError?: Error;
  _onUnMounts = new Set<() => void>();
  _onMounts = new Set<() => void>();
  _providedValue: any;

  // When constructing the provider for the reactive context we only keep a reference to the
  // context and any parent reactive context container
  constructor(
    public reactiveContextRef: ReactiveComponent<any>,
    // When the ReactiveContextProvider mounts it uses the React context to find the parent
    // reactive context container
    public parent: ReactiveContextContainer | null,
  ) {}
  provideValue(value: any) {
    this._providedValue = value;
  }
  getProvidedValue() {
    return this._providedValue;
  }
  hasProvidedValue() {
    return this._providedValue !== undefined;
  }
  registerOnUnmount(unMounter: () => void) {
    this._onUnMounts.add(unMounter);
  }
  registerOnMount(mounter: () => void) {
    this._onMounts.add(mounter);
  }
  hasCleanup() {
    return Boolean(this._onUnMounts.size);
  }
  resolve<T>(reactiveContext: ReactiveComponent<any>): T {
    // If there is an error resolving the reactive context we throw it
    if (this._resolvementError) {
      throw this._resolvementError;
    }

    // If we are trying to resolve the reactive context this container is responsbile for and
    // it has already been resolved, we return it
    if (reactiveContext === this.reactiveContextRef) {
      return this._providedValue;
    }

    // If the reactive context is not matching this reactive context container and we have a parent, we start resolving the
    // reactive context at the parent instead
    if (this.parent) {
      return this.parent.resolve(reactiveContext);
    }

    throw new Error(`No provider could be found for ${reactiveContext?.name}`);
  }
  unMount() {
    this._onUnMounts.forEach((cleaner) => {
      cleaner();
    });
  }
}

// The context for the reactive contextContainer
const reactiveContextContainerContext =
  createContext<ReactiveContextContainer | null>(null);

// @ts-ignore
reactiveContextContainerContext.Provider.displayName = "StateProvider";

type Converter<T> = (prop: T) => {
  get(): any;
  set(newProp: T): void;
};

const canUseDOM = !!(
  typeof window !== "undefined" &&
  window.document &&
  window.document.createElement
);

const SSRContext = createContext<MutableRefObject<boolean> | null>(null);

export function SSR({ children }: { children: ReactNode }) {
  const hydrationRef = useRef(true);

  useEffect(() => {
    hydrationRef.current = false;
  });

  return createElement(SSRContext.Provider, { value: hydrationRef }, children);
}

export function configureComponent(
  toObservableProp: Converter<any>,
  observer: (cb: () => void) => () => void,
) {
  return function createComponent<P extends Record<string, unknown>>(
    setup: ReactiveComponent<P>,
  ) {
    const ReactiveComponent = memo((props: P) => {
      const [_, forceRender] = useState(0);
      const isHydratingRef = useContext(SSRContext);
      const parentReactiveComponent = useContext(
        reactiveContextContainerContext,
      );
      const childrenRef = useRef<any>();
      const observablePropsRef = useRef<any>();
      const uiDisposerRef = useRef<any>();
      const containerRef = useRef<any>();
      const uiRef = useRef<any>(null);

      // @ts-ignore
      // eslint-disable-next-line
      childrenRef.current = props.children;

      function configureComponent() {
        containerRef.current = new ReactiveContextContainer(
          setup,
          // eslint-disable-next-line
          // @ts-ignore
          parentReactiveComponent,
        );

        const observableProps = (observablePropsRef.current = {
          get children() {
            return childrenRef.current;
          },
        }) as any;

        for (const key in props) {
          if (key === "children") {
            continue;
          }
          observableProps[key] = toObservableProp(props[key]);
        }

        for (const key in observableProps) {
          Object.defineProperty(observableProps, key, {
            get: () => {
              return observableProps[key].get();
            },
          });
        }

        resolvingReactiveContextContainers.push(containerRef.current);
        uiRef.current = setup(observableProps, {
          onDidMount,
          onWillUnmount,
        });
        resolvingReactiveContextContainers.pop();

        if (isHydratingRef && isHydratingRef.current) {
          return;
        }

        forceRender((current) => current + 1);
      }

      function renderUi(render: any) {
        uiDisposerRef.current?.();
        let result: ReactNode;

        uiDisposerRef.current = observer(() => {
          if (result !== undefined) {
            forceRender(render());
            return;
          }
          // @ts-ignore
          // eslint-disable-next-line
          result = render();
        });

        if (containerRef.current.hasProvidedValue()) {
          return createElement(
            reactiveContextContainerContext.Provider,
            {
              value: containerRef.current,
            },
            result,
          );
        }

        return result;
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
      }, [props]);

      useLayoutEffect(() => {
        if (observablePropsRef.current) {
          return;
        }

        configureComponent();

        return () => {
          containerRef.current.unMount();
          uiDisposerRef.current?.();
        };
      }, []);

      // First render on client we can safely assume it will be mounted
      if (canUseDOM && isHydratingRef && isHydratingRef.current) {
        configureComponent();

        return renderUi(uiRef.current);
      }

      // Any other render on client in risk of concurrent issues
      if (canUseDOM) {
        return uiRef.current && renderUi(uiRef.current);
      }

      // SSR
      return setup(props, {
        onDidMount() {},
        onWillUnmount() {},
      })();
    });

    ReactiveComponent.displayName = setup.name;

    return ReactiveComponent;
  };
}

export function createProvider<T>() {
  let reactiveContext: ReactiveComponent<any>;

  function provide(value: T) {
    const reactiveContextContainer = getResolvingReactiveContextContainer();

    if (!reactiveContextContainer) {
      throw new Error('Can not call "provide" outside a reactive context');
    }

    reactiveContextContainer.provideValue(value);
    reactiveContext = reactiveContextContainer.reactiveContextRef;
  }

  function inject(): T {
    const resolvingReactiveContextContainer =
      getResolvingReactiveContextContainer();

    // If we are not currently resolving a reactive context, we assume that we are resolving from a component as
    // you can really only initiate resolving reactive contexts from components
    if (!resolvingReactiveContextContainer) {
      // We try to find a reactive context container on the context first, to resolve a reactive context from it
      const reactiveContextContainer = useContext(
        reactiveContextContainerContext,
      );

      if (reactiveContextContainer) {
        return reactiveContextContainer.resolve(reactiveContext);
      }

      throw new Error(
        `No provider could be found for ${reactiveContext?.name}`,
      );
    }

    // At this point we are not in a component and we resolve the reactive context as normal
    return resolvingReactiveContextContainer.resolve(reactiveContext);
  }

  return [provide, inject] as const;
}

export function onDidMount(cb: () => void) {
  const resolvingReactiveContextContainer =
    getResolvingReactiveContextContainer();

  if (!resolvingReactiveContextContainer) {
    throw new Error(
      '"onDidMount" can only be used when creating a reactive component',
    );
  }

  resolvingReactiveContextContainer.registerOnMount(cb);
}

export function onWillUnmount(cb: () => void) {
  const resolvingReactiveContextContainer =
    getResolvingReactiveContextContainer();

  if (!resolvingReactiveContextContainer) {
    throw new Error(
      '"onDidMount" can only be used when creating a reactive component',
    );
  }

  resolvingReactiveContextContainer.registerOnUnmount(cb);
}
