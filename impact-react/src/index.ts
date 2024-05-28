import React, {
  Component,
  ReactNode,
  createContext,
  useContext,
  createElement,
  useRef,
  useSyncExternalStore,
} from "react";

/**
 * ### STORE ###
 */

const currentStoreContainer: StoreContainer[] = [];
const registeredProvidedStores = new Set<Store<any, any>>();
const isDevelopment = () => typeof signalDebugHooks.onSetValue === "function";

export function getActiveStoreContainer() {
  return currentStoreContainer[currentStoreContainer.length - 1];
}

export type Store<
  T extends Record<string, unknown>,
  A extends Record<string, unknown> | void,
> = (props: A) => T;

export type StoreState =
  | {
      isResolved: true;
      value: any;
      ref: Store<any, any>;
    }
  | {
      isResolved: false;
      constr: () => any;
      ref: Store<any, any>;
    };

class StoreContainer {
  // For obscure reasons (https://github.com/facebook/react/issues/17163#issuecomment-607510381) React will
  // swallow the first error on render and render again. To correctly throw the initial error we keep a reference to it
  private _resolvementError?: Error;
  private _state: StoreState;
  private _disposers = new Set<() => void>();
  private _isDisposed = false;

  get isDisposed() {
    return this._isDisposed;
  }

  constructor(
    ref: Store<any, any>,
    constr: () => any,
    private _parent: StoreContainer | null,
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
  resolve<
    T extends Record<string, unknown>,
    A extends Record<string, unknown> | void,
  >(store: Store<T, A>): T {
    if (this._resolvementError) {
      throw this._resolvementError;
    }

    if (this._state.isResolved && store === this._state.ref) {
      return this._state.value;
    }

    if (!this._state.isResolved && this._state.ref === store) {
      try {
        currentStoreContainer.push(this);
        this._state = {
          isResolved: true,
          value: this._state.constr(),
          ref: store,
        };
        currentStoreContainer.pop();

        return this._state.value;
      } catch (e) {
        this._resolvementError =
          new Error(`Could not initialize store "${store?.name}":
${String(e)}`);
        throw this._resolvementError;
      }
    }

    if (this._parent) {
      return this._parent.resolve(store);
    }

    let resolvedStore = globalStores.get(store);

    if (!resolvedStore && registeredProvidedStores.has(store)) {
      throw new Error(
        `The store ${store.name} should be provided on a context, but no provider was found`,
      );
    }

    if (!resolvedStore) {
      // @ts-ignore
      resolvedStore = store();
      globalStores.set(store, resolvedStore);
    }

    return resolvedStore;
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

const storeContainerContext = createContext<StoreContainer | null>(null);

export class StoreContainerProvider<
  T extends Record<string, unknown> | void,
> extends Component<{
  store: Store<any, any>;
  props: T;
  children: React.ReactNode;
}> {
  static contextType = storeContainerContext;
  container!: StoreContainer;
  componentWillUnmount(): void {
    this.container.dispose();
  }
  render(): ReactNode {
    // React can keep the component reference and mount/unmount it multiple times. Because of that
    // we need to ensure to always have a hooks container instantiated when rendering, as it could
    // have been disposed due to an unmount
    if (!this.container || this.container.isDisposed) {
      this.container = new StoreContainer(
        this.props.store,
        () => this.props.store(this.props.props),
        // eslint-disable-next-line
        // @ts-ignore
        this.context,
      );
    }

    return createElement(
      storeContainerContext.Provider,
      {
        value: this.container,
      },
      this.props.children,
    );
  }
}

export function cleanup(cleaner: () => void) {
  const activeStoreContainer = getActiveStoreContainer();

  // We do not want to clean up if we are not in a context, which
  // means we are just globally running the store
  if (!activeStoreContainer) {
    return;
  }

  activeStoreContainer.registerCleanup(cleaner);
}

const globalStores = new Map<Store<any, any>, any>();

let activeComponentObserverContext: ObserverContext | null = null;

export function useStore<
  T extends Record<string, unknown>,
  A extends Record<string, unknown> | void,
>(store: Store<T, A>): T & { [Symbol.dispose](): void } {
  const activeStoreContainer = getActiveStoreContainer();
  let resolvedStore: T;

  if (!activeStoreContainer) {
    const storeContainer = useContext(storeContainerContext);

    if (storeContainer) {
      resolvedStore = storeContainer.resolve<T, A>(store);
    } else {
      resolvedStore = globalStores.get(store);

      if (!resolvedStore && registeredProvidedStores.has(store)) {
        throw new Error(
          `The store ${store.name} should be provided on a context, but no provider was found`,
        );
      }

      if (!resolvedStore) {
        // @ts-ignore
        resolvedStore = store();
        globalStores.set(store, resolvedStore);
      }
    }

    if (activeComponentObserverContext) {
      // @ts-ignore
      resolvedStore[Symbol.dispose] = () => {
        // @ts-ignore
        delete resolvedStore[Symbol.dispose];
      };

      // @ts-ignore
      return resolvedStore;
    }

    const observerContext = (activeComponentObserverContext = observer());

    let popObserverContextStack: string | undefined;

    if (isDevelopment()) {
      popObserverContextStack = new Error().stack;

      Promise.resolve().then(() => {
        if (popObserverContextStack) {
          throw new Error(`You did not use the "using" keyword, observability will not work:

${popObserverContextStack}`);
        }
      });
    }

    // @ts-ignore
    resolvedStore[Symbol.dispose] = () => {
      popObserverContextStack = undefined;
      activeComponentObserverContext = null;
      // @ts-ignore
      delete resolvedStore[Symbol.dispose];
      observerContext.pop();
    };

    // @ts-ignore
    return resolvedStore;
  }

  resolvedStore = activeStoreContainer.resolve(store);

  // @ts-ignore
  resolvedStore[Symbol.dispose] = () => {
    // @ts-ignore
    delete resolvedStore[Symbol.dispose];
    console.warn('There is no need to use "using" in stores');
  };

  // @ts-ignore
  return resolvedStore;
}

export function createStoreProvider<
  T extends Record<string, unknown>,
  A extends Record<string, unknown> | void,
>(store: Store<T, A>) {
  registeredProvidedStores.add(store);
  const StoreProvider = (props: A & { children: React.ReactNode }) => {
    // To avoid TSLIB
    const extendedProps = Object.assign({}, props);
    const children = extendedProps.children;

    delete extendedProps.children;

    return createElement(
      StoreContainerProvider,
      // @ts-ignore
      {
        props: extendedProps,
        store,
      },
      children,
    );
  };

  StoreProvider.displayName = store.name
    ? `${store.name}Provider`
    : "AnonymousStoreProvider";

  StoreProvider.provide = (component: React.FC<A>) => {
    return (props: A) => {
      return createElement(
        StoreProvider,
        // @ts-ignore
        props,
        // @ts-ignore
        createElement(component, props),
      );
    };
  };

  return StoreProvider;
}

/**
 * ### SIGNAL ###
 */

// @ts-ignore
Symbol.dispose ??= Symbol("Symbol.dispose");

// Use for memory leak debugging
// const registry = new FinalizationRegistry((message) => console.log(message));

export type ObserverContextType = "component" | "derived" | "effect";

export const signalDebugHooks: {
  onGetValue?: (context: ObserverContext, signal: SignalTracker) => void;
  onSetValue?: (
    signal: SignalTracker,
    value: unknown,
    derived?: boolean,
  ) => void;
  onEffectRun?: (effect: () => void) => void;
} = {};

export class ObserverContext {
  static stack: ObserverContext[] = [];
  static get current(): ObserverContext | undefined {
    return ObserverContext.stack[ObserverContext.stack.length - 1];
  }
  private _getters = new Set<SignalTracker>();
  private _setters = new Set<SignalTracker>();
  private _onUpdate?: () => void;
  public stack = "";
  snapshot = 0;

  constructor(public type: "component" | "derived" | "effect") {
    ObserverContext.stack.push(this);

    if (signalDebugHooks.onGetValue) {
      this.stack = new Error().stack || "";
    }
    // Use for memory leak debugging
    // registry.register(this, this.id + " has been collected");
  }
  registerGetter(signal: SignalTracker) {
    // We do not allow having getters when setting a signal, the reason is to ensure
    // no infinite loops
    if (this._setters.has(signal)) {
      return;
    }

    if (this._getters.has(signal)) {
      return;
    }

    this._getters.add(signal);

    /**
     * A context can be notified about an update between consumption
     * and subscription of a signal. We keep track of the latest signal snapshot
     * tracked to enable React to see a stale subscription and render again
     */
    this.snapshot = Math.max(
      ...Array.from(this._getters).map((signal) => signal.snapshot),
    );
  }
  registerSetter(signal: SignalTracker) {
    // We do not allow having getters when setting a signal, the reason is to ensure
    // no infinite loops
    if (this._getters.has(signal)) {
      this._getters.delete(signal);
    }

    this._setters.add(signal);
  }
  /**
   * There is only a single subscriber to any ObserverContext
   */
  subscribe(onUpdate: () => void) {
    this._onUpdate = onUpdate;

    this._getters.forEach((signal) => {
      signal.addContext(this);
    });

    return () => {
      this._getters.forEach((signal) => {
        signal.removeContext(this);
      });
    };
  }
  /**
   * Here we alway know that we get the very latest snapshot as it was just
   * generated, we immediately apply it and React will now re-render on subscription
   * because the snapshot changed
   */
  notify(snapshot: number) {
    this.snapshot = snapshot;
    const update = this._onUpdate;

    if (update) {
      this._getters = new Set();
      this._setters = new Set();
      this._onUpdate = undefined;
      update?.();
    }
  }
  pop() {
    ObserverContext.stack.pop();
  }
}

/**
 * This global counter makes sure that every signal update is unqiue and
 * can be tracked by React
 */
let nextSignalSnapshot = 0;

export class SignalTracker {
  private contexts = new Set<ObserverContext>();
  constructor(public getValue: () => unknown) {}
  snapshot = ++nextSignalSnapshot;
  addContext(context: ObserverContext) {
    this.contexts.add(context);
  }
  removeContext(context: ObserverContext) {
    this.contexts.delete(context);
  }
  notify() {
    // We always keep the snapshot up to date
    this.snapshot = ++nextSignalSnapshot;

    // A context can be synchronously added back to this signal related to firing the signal, which
    // could cause a loop. We only want to notify the current contexts
    const contexts = Array.from(this.contexts);

    contexts.forEach((context) => context.notify(this.snapshot));
  }
}

export type Signal<T> = {
  get value(): T extends Promise<infer V> ? ObservablePromise<V> : T;
  set value(value: T);
};

// We resolving contexts with an active ObserverContext, where we do not
// want to track any signals accessed
function isResolvingStoreFromComponent(context: ObserverContext) {
  return context.type === "component" && getActiveStoreContainer();
}

export function state<T extends Record<string, unknown>>(state: T): T {
  const wrappedState = {};

  Object.keys(state).forEach((key) => {
    const stateSignal = signal(state[key]);

    Object.defineProperty(wrappedState, key, {
      get() {
        return stateSignal.value;
      },
      set(value) {
        stateSignal.value = value;
      },
    });
  });

  return wrappedState as T;
}

export function signal<T>(initialValue: T) {
  let currentAbortController: AbortController | undefined;

  let value =
    initialValue && initialValue instanceof Promise
      ? createPromise(initialValue)
      : initialValue;

  const signal = new SignalTracker(() => value);

  function createPromise(promise: Promise<any>): ObservablePromise<T> {
    currentAbortController?.abort();

    const abortController = (currentAbortController = new AbortController());

    return createPendingPromise(
      promise
        .then(function (resolvedValue) {
          if (abortController.signal.aborted) {
            return;
          }

          value = createFulfilledPromise(
            Promise.resolve(resolvedValue),
            resolvedValue,
          );

          signal.notify();

          return resolvedValue;
        })
        .catch((rejectedReason) => {
          if (abortController.signal.aborted) {
            return;
          }

          const rejectedPromise = Promise.reject(rejectedReason);

          value = createRejectedPromise(rejectedPromise, rejectedReason);

          signal.notify();

          return rejectedPromise;
        }),
    );
  }

  return {
    get value() {
      if (
        ObserverContext.current &&
        !isResolvingStoreFromComponent(ObserverContext.current)
      ) {
        ObserverContext.current.registerGetter(signal);
        if (signalDebugHooks.onGetValue) {
          signalDebugHooks.onGetValue(ObserverContext.current, signal);
        }
      }

      return value;
    },
    set value(newValue) {
      if (value === newValue) {
        if (
          process.env.NODE_ENV === "development" &&
          typeof newValue === "object" &&
          newValue !== null
        ) {
          console.warn(
            "You are setting the same object in a signal, which will not trigger observers. Did you mutate it?",
            newValue,
          );
        }

        return;
      }

      if (newValue instanceof Promise) {
        newValue = createPromise(newValue);
      }

      const prevValue = value;

      value = newValue;

      if (signalDebugHooks.onSetValue) {
        signalDebugHooks.onSetValue(signal, value);
        ObserverContext.current?.registerSetter(signal);
      }

      if (value === prevValue) {
        return;
      }

      if (value instanceof Promise) {
        // We might set a Promise.resolve, in which case we do not want to notify as the micro task has
        // already done it in "createPromise". So we run our own micro task to check if the promise
        // is still pending, where we do want to notify
        Promise.resolve().then(() => {
          if (value instanceof Promise && value.status === "pending") {
            signal.notify();
          }
        });
      } else {
        signal.notify();
      }
    },
  } as Signal<T>;
}

type PendingPromise<T> = Promise<T> & {
  status: "pending";
};

type FulfilledPromise<T> = Promise<T> & {
  status: "fulfilled";
  value: T;
};

type RejectedPromise<T> = Promise<T> & {
  status: "rejected";
  reason: unknown;
};

export type ObservablePromise<T> =
  | PendingPromise<T>
  | FulfilledPromise<T>
  | RejectedPromise<T>;

function createPendingPromise<T>(promise: Promise<T>): PendingPromise<T> {
  return Object.assign(promise, {
    status: "pending" as const,
  });
}

function createFulfilledPromise<T>(
  promise: Promise<T>,
  value: T,
): FulfilledPromise<T> {
  return Object.assign(promise, {
    status: "fulfilled" as const,
    value,
  });
}

function createRejectedPromise<T>(
  promise: Promise<T>,
  reason: unknown,
): RejectedPromise<T> {
  return Object.assign(promise, {
    status: "rejected" as const,
    reason,
  });
}

export function use<T>(promise: ObservablePromise<T>): T {
  if (promise.status === "pending") {
    throw promise;
  }

  if (promise.status === "rejected") {
    throw promise.reason;
  }

  return promise.value;
}

export function derived<T>(cb: () => T) {
  let value: T;
  let disposer: () => void;
  let isDirty = true;
  const signal = new SignalTracker(() => value);

  return {
    get value() {
      if (
        ObserverContext.current &&
        !isResolvingStoreFromComponent(ObserverContext.current)
      ) {
        ObserverContext.current.registerGetter(signal);
        if (signalDebugHooks.onGetValue) {
          signalDebugHooks.onGetValue(ObserverContext.current, signal);
        }
      }

      if (isDirty) {
        disposer?.();

        const context = new ObserverContext("derived");

        value = cb();

        context.pop();

        disposer = context.subscribe(() => {
          isDirty = true;

          signal.notify();
        });

        isDirty = false;

        if (signalDebugHooks.onSetValue) {
          signalDebugHooks.onSetValue(signal, value, true);
        }
      }

      return value;
    },
  };
}

export function effect(cb: () => void) {
  let currentSubscriptionDisposer: () => void;

  const updater = () => {
    const context = new ObserverContext("effect");

    cb();
    context.pop();

    if (signalDebugHooks.onEffectRun) {
      signalDebugHooks.onEffectRun(cb);
    }

    return context.subscribe(() => {
      currentSubscriptionDisposer();
      currentSubscriptionDisposer = updater();
    });
  };

  currentSubscriptionDisposer = updater();

  return cleanup(currentSubscriptionDisposer);
}

export function observer() {
  const contextRef = useRef<ObserverContext>();

  if (!contextRef.current) {
    contextRef.current = new ObserverContext("component");
  }

  const context = contextRef.current;

  useSyncExternalStore(
    // This is only a notifier, it does not cause a render
    (update) => context.subscribe(update),
    // This value needs to change for a render to happen. It is also
    // used to detect a stale subscription. If snapshot changed between
    // last time and the subscription it will do a new render
    () => context.snapshot,
    () => context.snapshot,
  );

  return context;
}
