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

// We use a global reference to the provided values from "context". This allows us
// to attach the resolved values to the reactive context container
let lastProvidedReactiveContext: any;

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

// The type for a reactive context, which is just a function with optional props returning whatever
export type ReactiveContext<T, A extends Record<string, unknown> | void> = (
  props: A,
) => T;

// We keep track of the resolved state of a reactive context
export type ReactiveContextState =
  | {
      isResolved: true;
      reactiveContext: any;
      reactiveContextRef: ReactiveContext<any, any>;
    }
  | {
      isResolved: false;
      // The constructor is not the reactive context itself, but a function created
      // by ReactiveContextProvider which includes the props
      reactiveContextConstr: () => any;
      reactiveContextRef: ReactiveContext<any, any>;
    };

// A reactive context container is created by the ReactiveContextProvider in React. When using the "useReactiveContext" hook it first finds the
// context providing the reactive context container and then resolves the context
class ReactiveContextContainer {
  // For obscure reasons (https://github.com/facebook/react/issues/17163#issuecomment-607510381) React will
  // swallow the first error on render and render again. To correctly throw the initial error we keep a reference to it
  _resolvementError?: Error;
  _state: ReactiveContextState;
  _disposers = new Set<() => void>();
  // The values registered with "context"
  contextValues: any;

  // When constructing the provider for the reactive context we only keep a reference to the
  // context and any parent reactive context container
  constructor(
    reactiveContextRef: ReactiveContext<any, any>,
    constr: () => any,
    // When the ReactiveContextProvider mounts it uses the React context to find the parent
    // reactive context container
    public parent: ReactiveContextContainer | null,
  ) {
    this._state = {
      isResolved: false,
      reactiveContextRef,
      reactiveContextConstr: constr,
    };
  }
  // When resolving the reactive context we use a global "cleanup" function which accesses the currently resolving
  // context and registers the cleanup function
  registerCleanup(cleaner: () => void) {
    this._disposers.add(cleaner);
  }
  resolve<T, A extends Record<string, unknown> | void>(
    reactiveContext: ReactiveContext<T, A>,
  ): T {
    // If there is an error resolving the reactive context we throw it
    if (this._resolvementError) {
      throw this._resolvementError;
    }

    // If we are trying to resolve the reactive context this container is responsbile for and
    // it has already been resolved, we return it
    if (
      this._state.isResolved &&
      reactiveContext === this._state.reactiveContextRef
    ) {
      return this._state.reactiveContext;
    }

    // If we are trying to resolve the reactive context this container is responsible for and
    // it has NOT been resolved, we resolve it
    if (
      !this._state.isResolved &&
      this._state.reactiveContextRef === reactiveContext
    ) {
      try {
        // We push to our global tracking of resolvement
        resolvingReactiveContextContainers.push(this);
        // We resolve simply by calling the constructor
        this._state = {
          isResolved: true,
          reactiveContext: this._state.reactiveContextConstr(),
          reactiveContextRef: reactiveContext,
        };
        // We have called the reactive context and events might have been registered with "receiver"
        this.contextValues = lastProvidedReactiveContext;
        lastProvidedReactiveContext = undefined;
        // We pop off the resolvement tracker
        resolvingReactiveContextContainers.pop();

        return this._state.reactiveContext;
      } catch (e) {
        // See comment on why we need to do this
        this._resolvementError =
          new Error(`Could not initialize reactive context "${reactiveContext?.name}":
${String(e)}`);
        throw this._resolvementError;
      }
    }

    // If the reactive context is not matching this reactive context container and we have a parent, we start resolving the
    // reactive context at the parent instead
    if (this.parent) {
      return this.parent.resolve(reactiveContext);
    }

    throw new Error(`No provider could be found for ${reactiveContext?.name}`);
  }
  cleanup() {
    this._disposers.forEach((cleaner) => {
      cleaner();
    });
  }
}

// The context for the reactive contextContainer
const reactiveContextContainerContext =
  createContext<ReactiveContextContainer | null>(null);

// We allow running this "cleanup" function globally. It uses the
// currently resolving container to register the cleanup function
export function cleanup(cleaner: () => void) {
  const resolvingReactiveContextContainer =
    getResolvingReactiveContextContainer();

  if (!resolvingReactiveContextContainer) {
    throw new Error(
      '"cleanup" can only be used when creating a reactive context',
    );
  }

  resolvingReactiveContextContainer.registerCleanup(cleaner);
}

// "usereactive context" can be used in both components and reactive contexts. When resolving from a component
// it will create an observer context and resolve the reactive context. If resolving from a reactive context it will
// only resolve the reactive context
function useReactiveContext<
  T extends Record<string, unknown>,
  A extends Record<string, unknown> | void,
>(reactiveContext: ReactiveContext<T, A>): T {
  const resolvingReactiveContextContainer =
    getResolvingReactiveContextContainer();

  // If we are not currently resolving a reactive context, we assume that we are resolving from a component as
  // you can really only initiate resolving reactive contexts from components
  if (!resolvingReactiveContextContainer) {
    // We try to find a reactive context container on the context first, to resolve a reactive context from it
    const reactiveContextContainer = useContext(
      reactiveContextContainerContext,
    );

    if (reactiveContextContainer && !isProduction) {
      const unblockDispatcher = blockDispatcher();
      try {
        return reactiveContextContainer.resolve<T, A>(reactiveContext);
      } finally {
        unblockDispatcher();
      }
    }

    if (reactiveContextContainer) {
      return reactiveContextContainer.resolve<T, A>(reactiveContext);
    }

    throw new Error(`No provider could be found for ${reactiveContext?.name}`);
  }

  // At this point we are not in a component and we resolve the reactive context as normal
  return resolvingReactiveContextContainer.resolve(reactiveContext);
}

type Converter<T> = (prop: T) => {
  get(): any;
  set(newProp: T): void;
};

export function configureReactiveContext(toObservableProp: Converter<any>) {
  // This function creates the actual hook and related reactive contextProvider component, which is responsible for converting
  // props into signals and keep them up to date. Also isolate the children in this component, as
  // those are not needed in the reactive context
  return function createReactiveContext<
    T extends Record<string, unknown>,
    A extends Record<string, any> | void,
  >(
    reactiveContext: ReactiveContext<T, A>,
  ): (() => T) & {
    Provider: React.ComponentClass<
      A extends void
        ? { children: React.ReactNode }
        : A & { children: React.ReactNode }
    >;
  } {
    // The reactive contextProvider provides the reactive context container which resolves the reactive context. We use a class because
    // we need the "componentWillUnmount" lifecycle hook
    class ReactiveContextProvider extends Component {
      static displayName = reactiveContext.name
        ? `${reactiveContext.name}Provider`
        : "AnonymousReactiveContextProvider";
      static contextType = reactiveContextContainerContext;
      // We need to track the mounted state, as StrictMode will call componentDidMount
      // and componentWillUnmount twice, meaning we'll cleanup too early. These are safeguards
      // for some common misuse of Reacts primitives. But here we know what we are doing. We
      // want to instantiate the reactive contextContainer immediately so it is part of the rendering
      // of the children and clean it up when this component unmounts
      mounted = false;
      // We convert props into signals
      observableProps: any = {};
      constructor(props: any, context: any) {
        super(props, context);
        for (const key in props) {
          if (key === "children") {
            continue;
          }
          this.observableProps[key] = toObservableProp(props[key]);
        }
      }
      reactiveContextConstructor = () => {
        const observableProps: any = {};
        for (const key in this.observableProps) {
          Object.defineProperty(observableProps, key, {
            get: () => {
              return this.observableProps[key].get();
            },
          });
        }
        return reactiveContext(observableProps);
      };
      container = new ReactiveContextContainer(
        reactiveContext,
        this.reactiveContextConstructor,
        // eslint-disable-next-line
        // @ts-ignore
        this.context,
      );
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
        this.container.cleanup();
        this.container = new ReactiveContextContainer(
          reactiveContext,
          this.reactiveContextConstructor,
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
          reactiveContextContainerContext.Provider,
          {
            value: this.container,
          },
          // We create a Suspense boundary for the reactive context to throw an error of misuse. reactive contextProviders does not support
          // suspense because they will be-reinstantiated or can risk not cleaning up as the parent Suspense boundary
          // is unmounted and the "componentWillUnmount" will never be called. In practice it does not make sense
          // to have these parent suspense boundaries, but just to help out
          createElement(
            Suspense,
            {
              fallback: createElement(() => {
                throw new Error(
                  "The ReactiveContextProvider does not support suspense. Please add a Suspense boundary between the ReactiveContextProvider and the components using suspense",
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

    const hook = () => useReactiveContext(reactiveContext);

    hook.Provider = ReactiveContextProvider;

    return hook as any;
  };
}

export function context<T extends Record<string, any>>(): T;
export function context<T extends Record<string, any>>(context: T): void;
export function context<T extends Record<string, any>>(context?: T) {
  const reactiveContextContainer = getResolvingReactiveContextContainer();

  if (!reactiveContextContainer) {
    throw new Error('Can not call "context" outside a reactive context');
  }

  if (context) {
    lastProvidedReactiveContext = context;

    return;
  }

  return new Proxy(
    {},
    {
      get(_, injectKey: string) {
        let currentReactiveContextContainer = reactiveContextContainer;
        while (currentReactiveContextContainer) {
          if (currentReactiveContextContainer.contextValues?.[injectKey]) {
            return currentReactiveContextContainer.contextValues[injectKey];
          }

          if (currentReactiveContextContainer.parent) {
            currentReactiveContextContainer =
              currentReactiveContextContainer.parent;
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
