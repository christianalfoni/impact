import { Component, ReactNode, createContext, useContext } from "react";

const currentReactiveHooks: ReactiveHooks[] = [];

export type ReactiveHook<T> = (...args: any[]) => T;

export type ReactiveHookTuple<T> = [ReactiveHook<T>, () => T];

export type ReactiveHookState =
  | {
      isResolved: true;
      value: any;
    }
  | {
      isResolved: false;
      constr?: () => any;
    };

class ReactiveHooks {
  private _reactiveHooks = new Map<ReactiveHook<any>, ReactiveHookState>();
  private _disposers = new Set<() => void>();

  constructor(
    reactiveHooks: Array<ReactiveHook<any> | ReactiveHookTuple<any>>,
    private _parent: ReactiveHooks | null
  ) {
    reactiveHooks.forEach((reactiveHook) => {
      if (Array.isArray(reactiveHook)) {
        this.register(reactiveHook[0], reactiveHook[1]);
      } else {
        this.register(reactiveHook);
      }
    });
  }
  register<T>(reactiveHook: ReactiveHook<T>, constr?: () => T) {
    const state: ReactiveHookState = {
      isResolved: false,
      constr,
    };

    this._reactiveHooks.set(reactiveHook, state);

    return state;
  }
  registerCleanup(cleaner: () => void) {
    this._disposers.add(cleaner);
  }
  resolve<T>(reactiveHook: ReactiveHook<T>): T {
    let existingReactiveHook = this._reactiveHooks.get(reactiveHook);

    // We resolve up the tree when we have a parent and not hook registered
    if (!existingReactiveHook && this._parent) {
      return this._parent.resolve(reactiveHook);
    }

    // If we are at the top we register it if not already registered
    if (!existingReactiveHook) {
      existingReactiveHook = this.register(reactiveHook);
    }

    // If it is not resolved, we resolve it
    if (!existingReactiveHook.isResolved) {
      currentReactiveHooks.push(this);
      existingReactiveHook = {
        isResolved: true,
        value: existingReactiveHook.constr
          ? existingReactiveHook.constr()
          : reactiveHook(),
      };
      currentReactiveHooks.pop();
      this._reactiveHooks.set(reactiveHook, existingReactiveHook);
    }

    return existingReactiveHook.value;
  }
  dispose() {
    this._disposers.forEach((cleaner) => {
      cleaner();
    });
  }
}

const globalReactiveHooks = new ReactiveHooks([], null);

const context = createContext<ReactiveHooks | null>(null);

export class ReactiveHooksProvider extends Component<{
  hooks: Array<ReactiveHook<any> | ReactiveHookTuple<any>>;
  children: React.ReactNode;
}> {
  static contextType = context;
  state = new ReactiveHooks(
    this.props.hooks,
    this.context as ReactiveHooks | null
  );
  componentWillUnmount(): void {
    this.state.dispose();
  }
  render(): ReactNode {
    return (
      <context.Provider value={this.state}>
        {this.props.children}
      </context.Provider>
    );
  }
}

export function useDispose(cleaner: () => void) {
  const reactiveHooks = currentReactiveHooks[currentReactiveHooks.length - 1];

  if (!reactiveHooks) {
    throw new Error("You are cleaning up in an invalid context");
  }

  reactiveHooks.registerCleanup(cleaner);
}

export function useGlobalReactiveHook<T>(hook: ReactiveHook<T>): T {
  return globalReactiveHooks.resolve<T>(hook);
}

export function useReactiveHook<T>(hook: ReactiveHook<T>): T {
  const reactiveHooks = currentReactiveHooks[currentReactiveHooks.length - 1];

  if (!reactiveHooks) {
    const reactiveHooksContext = useContext(context);

    if (!reactiveHooksContext) {
      throw new Error(
        `The reactive hook "${hook.name}" is not registered to a ReactiveHooksProvider`
      );
    }

    return reactiveHooksContext.resolve<T>(hook);
  }

  return reactiveHooks.resolve(hook);
}
