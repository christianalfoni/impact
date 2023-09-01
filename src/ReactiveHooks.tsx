import { Component, ReactNode, createContext, useContext } from "react";
import { ObserverContext, observe } from "./Signal";

const currentHooksContainer: HooksContainer[] = [];

export type Hook<T extends Record<string, unknown>, A extends any[]> = (
  ...args: A
) => T;

export type HookState =
  | {
      isResolved: true;
      value: any;
    }
  | {
      isResolved: false;
      constr: () => any;
    };

type HooksContainerType =
  | {
      type: "global";
    }
  | {
      type: "root";
      parent: HooksContainer;
    }
  | {
      type: "default";
      parent: HooksContainer;
    };

class HooksContainer {
  private _hooks = new Map<Hook<any, any[]>, HookState>();
  private _disposers = new Set<() => void>();
  private _isDisposed = false;

  get isDisposed() {
    return this._isDisposed;
  }

  constructor(
    hooks: Array<Hook<any, any[]> | [Hook<any, any[]>, () => any]>,
    private _type: HooksContainerType
  ) {
    hooks.forEach((hook) => {
      if (Array.isArray(hook)) {
        this.register(hook[0], hook[1]);
      } else {
        this.register(hook, () => hook());
      }
    });
  }
  register(reactiveHook: Hook<any, any[]>, constr: () => any) {
    const state: HookState = {
      isResolved: false,
      constr,
    };

    this._hooks.set(reactiveHook, state);

    return state;
  }
  registerCleanup(cleaner: () => void) {
    this._disposers.add(cleaner);
  }
  resolve<T extends Record<string, unknown>, A extends any[]>(
    reactiveHook: Hook<T, A>
  ): T {
    let existingHook = this._hooks.get(reactiveHook);

    if (!existingHook) {
      // If we are at the global container, we register the hook automatically
      if (this._type.type === "global") {
        // @ts-ignore
        this.register(reactiveHook, () => reactiveHook());

        return this.resolve(reactiveHook);
      }

      // If we are at a root container we stop resolving and rather throw an error
      if (this._type.type === "root") {
        throw new Error(
          `The hook "${reactiveHook.name}" is not registered to a HooksProvider`
        );
      }

      // We resolve up the tree when we have a parent and not hook registered
      return this._type.parent.resolve(reactiveHook);
    }

    // If we are at the top we register it if not already registered

    // If it is not resolved, we resolve it
    if (!existingHook.isResolved) {
      currentHooksContainer.push(this);
      existingHook = {
        isResolved: true,
        value: existingHook.constr(),
      };
      currentHooksContainer.pop();
      this._hooks.set(reactiveHook, existingHook);
    }

    return existingHook.value;
  }
  dispose() {
    this._disposers.forEach((cleaner) => {
      cleaner();
    });

    this._isDisposed = true;
  }
}

export const globalHooksContainer = new HooksContainer([], {
  type: "global",
});

const context = createContext<HooksContainer | null>(null);

type HooksProviderProps<
  T extends Array<Hook<any, any[]> | [Hook<any, any>, () => any]>
> = {
  hooks: T;
  isRootProvider?: boolean;
  children: React.ReactNode;
};

export class HooksProvider<
  T extends Array<Hook<any, any[]> | [Hook<any, any>, () => any]>
> extends Component<HooksProviderProps<T>> {
  static contextType = context;
  state: HooksContainer;
  constructor(
    props: HooksProviderProps<T>,
    context: React.ContextType<React.Context<HooksContainer | null>>
  ) {
    super(props);
    this.state = new HooksContainer(
      props.hooks,
      props.isRootProvider
        ? {
            type: "root",
            parent: context || globalHooksContainer,
          }
        : {
            type: "default",
            parent: context || globalHooksContainer,
          }
    );
  }
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

export function createHooksProvider<
  T extends {
    [name: string]: (() => any) & { [HOOK_REFERENCE]: Hook<any, any> };
  }
>(hooks: T) {
  return function ScopedHooksProvider(
    props: {
      [U in keyof T as T[U] extends () => any ? never : U]: Parameters<T[U]>[0];
    } & { children: React.ReactNode; isRootProvider?: boolean }
  ) {
    return (
      <HooksProvider
        hooks={Object.keys(hooks).map((hookKey) => {
          if (hookKey in props) {
            return [
              hooks[hookKey][HOOK_REFERENCE],
              () => hooks[hookKey][HOOK_REFERENCE](props[hookKey as keyof T]),
            ];
          }

          return hooks[hookKey][HOOK_REFERENCE];
        })}
        isRootProvider={props.isRootProvider}
      >
        {props.children}
      </HooksProvider>
    );
  };
}

export function cleanup(cleaner: () => void) {
  const activeHooksContainer =
    currentHooksContainer[currentHooksContainer.length - 1];

  if (!activeHooksContainer) {
    throw new Error("You are cleaning up in an invalid context");
  }

  activeHooksContainer.registerCleanup(cleaner);
}

const HOOK_REFERENCE = Symbol("HOOK_REFERENCE");

export function createHook<T extends Record<string, unknown>, A extends any[]>(
  hook: Hook<T, A>
) {
  const hookRef = () => {
    const activeHooksContainer =
      currentHooksContainer[currentHooksContainer.length - 1];

    if (!activeHooksContainer) {
      const hooksContext = useContext(context);

      if (!hooksContext) {
        throw new Error(
          `The reactive hook "${hook.name}" has no ReactiveHooksProvider to register to`
        );
      }

      const result = hooksContext.resolve<T, A>(hook);

      const existingContext =
        ObserverContext.stack[ObserverContext.stack.length - 1];

      if (existingContext) {
        return Object.assign(result, {
          [Symbol.dispose]() {
            // We still use a resource, but do not dispose of anything as we already have a context
          },
        }) as any;
      }

      const observerContext = observe();

      if (process.env.NODE_ENV === "development") {
        let isDisposed = false;
        setTimeout(() => {
          if (!isDisposed) {
            console.warn(
              "Impact: You have a component that is not disposing the observer, did you forget to use the `using` keyword?"
            );
          }
        });
        return Object.assign(result, {
          [Symbol.dispose]() {
            isDisposed = true;
            observerContext.dispose();
          },
        }) as any;
      }

      return Object.assign(result, {
        [Symbol.dispose]() {
          observerContext.dispose();
        },
      }) as any;
    }

    return activeHooksContainer.resolve(hook);
  };

  hookRef[HOOK_REFERENCE] = hook;

  return hookRef as (() => T & { [Symbol.dispose](): void }) & {
    [HOOK_REFERENCE]: Hook<T, A>;
  };
}
