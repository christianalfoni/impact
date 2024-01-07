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

const currentContextContainer: ContextContainer[] = [];

export function getActiveContextContainer() {
  return currentContextContainer[currentContextContainer.length - 1];
}

export type Context<T, A extends Record<string, unknown> | void> = (
  props: A,
) => T;

export type ContextState =
  | {
      isResolved: true;
      value: any;
      ref: Context<any, any>;
    }
  | {
      isResolved: false;
      constr: () => any;
      ref: Context<any, any>;
    };

class ContextContainer {
  // For obscure reasons (https://github.com/facebook/react/issues/17163#issuecomment-607510381) React will
  // swallow the first error on render and render again. To correctly throw the initial error we keep a reference to it
  private _resolvementError?: Error;
  private _state: ContextState;
  private _disposers = new Set<() => void>();
  private _isDisposed = false;

  get isDisposed() {
    return this._isDisposed;
  }

  constructor(
    ref: Context<any, any>,
    constr: () => any,
    private _parent: ContextContainer | null,
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
  resolve<T, A extends Record<string, unknown> | void>(
    context: Context<T, A>,
  ): T {
    if (this._resolvementError) {
      throw this._resolvementError;
    }

    if (this._state.isResolved && context === this._state.ref) {
      return this._state.value;
    }

    if (!this._state.isResolved && this._state.ref === context) {
      try {
        currentContextContainer.push(this);
        this._state = {
          isResolved: true,
          value: this._state.constr(),
          ref: context,
        };
        currentContextContainer.pop();

        return this._state.value;
      } catch (e) {
        this._resolvementError =
          new Error(`Could not initialize context "${context?.name}":
${String(e)}`);
        throw this._resolvementError;
      }
    }

    if (!this._parent) {
      throw new Error(`The context "${context.name}" is not provided`);
    }

    return this._parent.resolve(context);
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

const reactContext = createContext<ContextContainer | null>(null);

export class ContextProvider<
  T extends Record<string, unknown> | void,
> extends Component<{
  context: Context<any, any>;
  props: T;
  children: React.ReactNode;
}> {
  static contextType = reactContext;
  container!: ContextContainer;
  componentWillUnmount(): void {
    this.container.dispose();
  }
  render(): ReactNode {
    // React can keep the component reference and mount/unmount it multiple times. Because of that
    // we need to ensure to always have a hooks container instantiated when rendering, as it could
    // have been disposed due to an unmount
    if (!this.container || this.container.isDisposed) {
      this.container = new ContextContainer(
        this.props.context,
        () => this.props.context(this.props.props),
        // eslint-disable-next-line
        // @ts-ignore
        this.context,
      );
    }

    return createElement(
      reactContext.Provider,
      {
        value: this.container,
      },
      this.props.children,
    );
  }
}

export function cleanup(cleaner: () => void) {
  const activeContextContainer = getActiveContextContainer();

  if (!activeContextContainer) {
    throw new Error("You are cleaning up in an invalid context");
  }

  activeContextContainer.registerCleanup(cleaner);
}

export const componentConsumptionHooks = {
  isConsuming: false,
  onConsume: () => {},
  onConsumed: () => {},
};

const globalContexts = new Map<Context<any, void>, any>();

export function globalContext<T>(context: Context<T, void>): () => T {
  return () => {
    const activeContextContainer = getActiveContextContainer();

    if (!activeContextContainer) {
      if (!componentConsumptionHooks.isConsuming) {
        componentConsumptionHooks.isConsuming = true;
        componentConsumptionHooks.onConsume();
      }
    }

    let contextContainer = globalContexts.get(context);

    if (!contextContainer) {
      contextContainer = context();
      globalContexts.set(context, contextContainer);
    }

    return contextContainer;
  };
}

export function context<T, A extends Record<string, unknown> | void>(
  context: Context<T, A>,
): (() => T) & {
  Provider: React.FC<A & { children: React.ReactNode }>;
} {
  const useReactiveContext = () => {
    const activeContextContainer = getActiveContextContainer();

    if (!activeContextContainer) {
      if (!componentConsumptionHooks.isConsuming) {
        componentConsumptionHooks.isConsuming = true;
        componentConsumptionHooks.onConsume();
      }

      const contextContainer = useContext(reactContext);

      if (!contextContainer) {
        throw new Error("You are using a store outside its provider");
      }

      return contextContainer.resolve<T, A>(context);
    }

    return activeContextContainer.resolve(context);
  };

  useReactiveContext.Provider = (props: A & { children: React.ReactNode }) => {
    // To avoid TSLIB
    const extendedProps = Object.assign({}, props);
    const children = extendedProps.children;

    delete extendedProps.children;

    return createElement(
      ContextProvider,
      // @ts-ignore
      {
        props: extendedProps,
        context,
      },
      children,
    );
  };

  // @ts-ignore
  useReactiveContext.Provider.displayName =
    context.name || "ReactiveContextProvider";

  return useReactiveContext as any;
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
