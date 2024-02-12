import { Component, Suspense, createElement } from "react";

export type BoundaryErrorProps<T extends Record<string, unknown>> = T & {
  error: Error;
  reset(): void;
};

export type ErrorBoundaryState =
  | {
      status: "IDLE";
    }
  | {
      status: "ERROR";
      error: Error;
    };

export class ErrorBoundary<
  T extends {
    fallback: React.FC<BoundaryErrorProps<any>>;
    children: React.ReactNode;
  },
> extends Component<T> {
  state: ErrorBoundaryState = {
    status: "IDLE",
  };

  // update the component state when an error occurs
  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    // specify that the error boundary has caught an error
    return {
      status: "ERROR",
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
  componentDidCatch() {
    // Maybe a prop hook to do something?
  }
  reset() {
    this.setState({
      status: "IDLE",
    });
  }
  render() {
    if (this.state.status === "ERROR") {
      const props = Object.assign({}, this.props, {
        error: this.state.error,
        reset: () => this.reset(),
      });

      // @ts-ignore
      delete props.fallback;

      return createElement(this.props.fallback, props);
    } else {
      return this.props.children;
    }
  }
}

export type BoundaryOptions<T extends Record<string, unknown>> =
  | {
      component: React.FC<T>;
      suspend: React.FC<T>;
    }
  | {
      component: React.FC<T>;
      error: React.FC<BoundaryErrorProps<T>>;
    }
  | {
      component: React.FC<T>;
      suspend: React.FC<T>;
      error: React.FC<BoundaryErrorProps<T>>;
    };

export function boundary<T extends Record<string, unknown>>(
  options: BoundaryOptions<T>,
) {
  function BoundaryComponent(props: T) {
    if ("suspend" in options && "error" in options) {
      const extendedProps = Object.assign({}, props, {
        fallback: options.error,
      });

      return createElement(
        ErrorBoundary,
        // @ts-ignore
        extendedProps,
        createElement(
          Suspense,
          {
            fallback: createElement(options.suspend, props),
          },
          createElement(options.component, props),
        ),
      );
    }

    if ("suspend" in options) {
      return createElement(
        Suspense,
        {
          fallback: createElement(options.suspend, props),
        },
        createElement(options.component, props),
      );
    }

    if ("error" in options) {
      const extendedProps = Object.assign({}, props, {
        fallback: options.error,
      });

      return createElement(
        ErrorBoundary,
        // @ts-ignore
        extendedProps,
        createElement(options.component, props),
      );
    }

    throw new Error("Invalid use of boundary");
  }

  return BoundaryComponent;
}
