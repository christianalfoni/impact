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

const isProduction =
  typeof process !== "undefined" && process.env.NODE_ENV === "production";

// A reactive context container is like an injection container. It is responsible for resolving a reactive context. As reactive contexts
// can resolve other contexts we keep track of the currently resolving reactive context
const resolvingReactiveContextContainers: Array<ReactiveContextContainer> = [];

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

export function configureComponent(
  toObservableProp: Converter<any>,
  observer: (cb: () => void) => () => void,
) {
  // This function creates the actual hook and related reactive contextProvider component, which is responsible for converting
  // props into signals and keep them up to date. Also isolate the children in this component, as
  // those are not needed in the reactive context
  return function createComponent<P extends Record<string, unknown>>(
    setup: ReactiveComponent<P>,
  ) {
    // The reactive contextProvider provides the reactive context container which resolves the reactive context. We use a class because
    // we need the "componentWillUnmount" lifecycle hook
    return class ReactiveContextProvider extends Component {
      static displayName = setup.name;
      static contextType = reactiveContextContainerContext;
      // We need to track the mounted state, as StrictMode will call componentDidMount
      // and componentWillUnmount twice, meaning we'll cleanup too early. These are safeguards
      // for some common misuse of Reacts primitives. But here we know what we are doing. We
      // want to instantiate the reactive contextContainer immediately so it is part of the rendering
      // of the children and clean it up when this component unmounts
      mounted = false;
      // We convert props into signals
      observableProps: any = {
        get children() {
          // eslint-disable-next-line
          return this.props.children;
        },
      };
      uiDisposer?: () => void;
      ui: () => ReactNode;
      constructor(props: any, context: any) {
        super(props, context);
        for (const key in props) {
          if (key === "children") {
            continue;
          }
          this.observableProps[key] = toObservableProp(props[key]);
        }
        const observableProps: any = {};
        for (const key in this.observableProps) {
          Object.defineProperty(observableProps, key, {
            get: () => {
              return this.observableProps[key].get();
            },
          });
        }

        resolvingReactiveContextContainers.push(this.container);
        this.ui = setup(observableProps, {
          onDidMount,
          onWillUnmount,
        });
        resolvingReactiveContextContainers.pop();
      }
      container = new ReactiveContextContainer(
        setup,
        // eslint-disable-next-line
        // @ts-ignore
        this.context,
      );
      renderUI() {
        this.uiDisposer?.();
        let result: ReactNode;

        this.uiDisposer = observer(() => {
          if (result !== undefined) {
            this.forceUpdate();
            return;
          }
          // @ts-ignore
          // eslint-disable-next-line
          result = this.ui();
        });

        return result;
      }
      shouldComponentUpdate(nextProps: any): boolean {
        for (const key in this.props) {
          // @ts-ignore
          if (nextProps[key] !== this.props[key]) {
            return true;
          }
        }

        for (const key in nextProps) {
          if (!(key in this.props)) {
            return true;
          }
        }

        return false;
      }
      componentDidMount(): void {
        this.mounted = true;
      }
      componentDidUpdate() {
        for (const key in this.observableProps) {
          // @ts-ignore
          this.observableProps[key].set(this.props[key]);
        }
      }
      // When an error is thrown we dispose of the reactive context. Then we throw the error up the component tree.
      // This ensures that an error thrown during render phase does not keep any subscriptions etc. going.
      // Recovering from the error in a parent error boundary will cause a new reactive context to be created. Developers
      // can still add nested error boundaries to control recoverable state
      componentDidCatch(error: Error): void {
        this.container.unMount();
        this.container = new ReactiveContextContainer(
          setup,
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
            this.container.unMount();
            this.uiDisposer?.();
          }
        });
      }
      render(): ReactNode {
        let children: any;

        if (isProduction) {
          // @ts-ignore
          // eslint-disable-next-line
          children = this.renderUI();
        } else {
          children = createElement(
            Suspense,
            {
              fallback: createElement(() => {
                throw new Error(
                  "The ReactiveComponent does not support suspense. Please add a Suspense boundary between the ReactiveComponent and the components using suspense",
                );
              }),
            },
            // @ts-ignore
            // eslint-disable-next-line
            this.renderUI(),
          );
        }

        if (this.container.hasProvidedValue()) {
          return createElement(
            reactiveContextContainerContext.Provider,
            {
              value: this.container,
            },
            // We create a Suspense boundary for the reactive context to throw an error of misuse. reactive contextProviders does not support
            // suspense because they will be-reinstantiated or can risk not cleaning up as the parent Suspense boundary
            // is unmounted and the "componentWillUnmount" will never be called. In practice it does not make sense
            // to have these parent suspense boundaries, but just to help out
            children,
          );
        }

        return children;
      }
    };
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
