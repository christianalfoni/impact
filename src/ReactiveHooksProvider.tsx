import { Component, ReactNode, createContext, useContext } from "react";

const currentHooksContainer: ReactiveHooksContainer[] = [];

export type ReactiveHook<T, A extends any[]> = (...args: A) => T;

export type ReactiveHookState =
  | {
      isResolved: true;
      value: any;
    }
  | {
      isResolved: false;
      constr: () => any;
    };

class ReactiveHooksContainer {
  private _hooks = new Map<ReactiveHook<any, any[]>, ReactiveHookState>();
  private _disposers = new Set<() => void>();
  private _isDisposed = false;

  get isDisposed() {
    return this._isDisposed;
  }

  constructor(
    hooks: Array<
      ReactiveHook<any, any[]> | [ReactiveHook<any, any[]>, () => any]
    >,
    private _parent: ReactiveHooksContainer | null,
    private _isGlobal: boolean = false,
  ) {
    hooks.forEach((hook) => {
      if (Array.isArray(hook)) {
        this.register(hook[0], hook[1]);
      } else {
        this.register(hook, () => hook());
      }
    });
  }
  register(hook: ReactiveHook<any, any[]>, constr: () => any) {
    const state: ReactiveHookState = {
      isResolved: false,
      constr,
    };

    this._hooks.set(hook, state);

    return state;
  }
  registerCleanup(cleaner: () => void) {
    this._disposers.add(cleaner);
  }
  resolve<T, A extends any[]>(hook: ReactiveHook<T, A>): T {
    let existingHook = this._hooks.get(hook);

    if (!existingHook) {
      // If we are at the global container, we register the hook automatically
      if (this._isGlobal) {
        // @ts-ignore
        this.register(hook, () => hook());

        return this.resolve(hook);
      }

      // If we are at a root container we stop resolving and rather throw an error
      if (!this._parent) {
        throw new Error(
          `The hook "${hook.name}" is not registered to a ReactiveHooksProvider`,
        );
      }

      // We resolve up the tree when we have a parent and not hook registered
      return this._parent.resolve(hook);
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
      this._hooks.set(hook, existingHook);
    }

    return existingHook.value;
  }
  clear() {
    this._disposers.forEach((cleaner) => {
      cleaner();
    });

    this._hooks = new Map();
  }
  dispose() {
    this.clear();
    this._isDisposed = true;
  }
}

export const globalHooksContainer = new ReactiveHooksContainer([], null, true);

const context = createContext<ReactiveHooksContainer | null>(null);

type HooksProviderProps<
  T extends Array<
    ReactiveHook<any, any[]> | [ReactiveHook<any, any>, () => any]
  >,
> = {
  hooks: T;
  children: React.ReactNode;
};

export class ReactiveHooksProvider<
  T extends Array<
    ReactiveHook<any, any[]> | [ReactiveHook<any, any>, () => any]
  >,
> extends Component<HooksProviderProps<T>> {
  static contextType = context;
  container!: ReactiveHooksContainer;

  componentWillUnmount(): void {
    console.log("DIPOOOOOSE");
    this.container.dispose();
  }
  render(): ReactNode {
    // React can keep the component reference and mount/unmount it multiple times. Because of that
    // we need to ensure to always have a hooks container instantiated when rendering, as it could
    // have been disposed due to an unmount
    if (!this.container || this.container.isDisposed) {
      this.container = new ReactiveHooksContainer(
        this.props.hooks,
        // eslint-disable-next-line
        // @ts-ignore
        this.context,
      );
    }

    return (
      <context.Provider value={this.container}>
        {this.props.children}
      </context.Provider>
    );
  }
}

export function createHooksProvider<
  T extends {
    [name: string]: (() => any) & { [STORE_REFERENCE]: ReactiveHook<any, any> };
  },
>(hooks: T) {
  return function ScopedReactiveHooksProvider(
    props: {
      [U in keyof T as T[U][typeof STORE_REFERENCE] extends () => any
        ? never
        : U]: Parameters<T[U][typeof STORE_REFERENCE]>[0];
    } & { children: React.ReactNode },
  ) {
    return (
      <ReactiveHooksProvider
        hooks={Object.keys(hooks).map((hookKey) => {
          if (hookKey in props) {
            return [
              hooks[hookKey][STORE_REFERENCE],
              () =>
                // @ts-ignore
                hooks[hookKey][STORE_REFERENCE](props[hookKey as keyof T]),
            ];
          }

          return hooks[hookKey][STORE_REFERENCE];
        })}
      >
        {props.children}
      </ReactiveHooksProvider>
    );
  };
}

export function useCleanup(cleaner: () => void) {
  const activeHooksContainer =
    currentHooksContainer[currentHooksContainer.length - 1];

  if (!activeHooksContainer) {
    throw new Error("You are cleaning up in an invalid context");
  }

  activeHooksContainer.registerCleanup(cleaner);
}

const STORE_REFERENCE = Symbol("STORE_REFERENCE");

export function createHook<T, A extends any[]>(hook: ReactiveHook<T, A>) {
  const hookRef = () => {
    const activeHooksContainer =
      currentHooksContainer[currentHooksContainer.length - 1];

    if (!activeHooksContainer) {
      const hookContainer = useContext(context) || globalHooksContainer;

      return hookContainer.resolve<T, A>(hook);
    }

    return activeHooksContainer.resolve(hook);
  };

  hookRef[STORE_REFERENCE] = hook;

  return hookRef as (() => T) & {
    [STORE_REFERENCE]: ReactiveHook<T, A>;
  };
}
