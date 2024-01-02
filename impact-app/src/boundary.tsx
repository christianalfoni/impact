import { Component, Suspense } from "react";

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
      const { fallback: _, ...props } = this.props;
      return (
        // @ts-ignore
        <this.props.fallback
          {...props}
          error={this.state.error}
          reset={() => this.reset()}
        />
      );
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
      return (
        <ErrorBoundary {...props} fallback={options.error}>
          <Suspense fallback={<options.suspend {...props} />}>
            <options.component {...props} />
          </Suspense>
        </ErrorBoundary>
      );
    }

    if ("suspend" in options) {
      return (
        <Suspense fallback={<options.suspend {...props} />}>
          <options.component {...props} />
        </Suspense>
      );
    }

    if ("error" in options) {
      return (
        <ErrorBoundary {...props} fallback={options.error}>
          <options.component {...props} />
        </ErrorBoundary>
      );
    }

    throw new Error("Invalid use of boundary");
  }

  return BoundaryComponent;
}
