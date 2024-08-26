import React, { FunctionComponent, useRef, useSyncExternalStore } from "react";
import {
  cleanup,
  getResolvingStoreContainer,
  createStore as createImpactStore,
  Store,
  receiver,
  emitter,
} from "impact-react-store";

export { cleanup, receiver, emitter };

// Use for memory leak debugging
// const registry = new FinalizationRegistry((message) => console.log(message));

export type ObserverContextType = "component" | "derived" | "effect";

// This object is used by the "impact-react-debugger" to access internals
export const signalDebugHooks: {
  onGetValue?: (context: ObserverContext, signal: SignalNotifier) => void;
  onSetValue?: (
    signal: SignalNotifier,
    value: unknown,
    derived?: boolean,
  ) => void;
  onEffectRun?: (effect: () => void) => void;
  onStoreMounted?: (
    store: { name: string; props: any },
    parentName?: string,
  ) => void;
} = {};

// When on server we drop out of using "useSyncExternalStore" as there is really no
// reason to run it (It holds no state, just subscribes to updates)
const isServer = typeof window === "undefined";

// This global counter makes sure that every signal update is unqiue and
// can be tracked by React
let currentSnapshot = 0;

// We need to know if we are resolving a store with an active ObserverContext
// for a component. If so we do not want to track signal access in the store
// itself
function isResolvingStoreFromComponent(observerContext: ObserverContext) {
  return observerContext.type === "component" && getResolvingStoreContainer();
}

export function createStore<
  T extends Record<string, unknown>,
  A extends Record<string, () => any>,
>(store: Store<T, A>) {
  return createImpactStore(
    store,
    (props) => {
      const signalProps: Record<string, Signal<any>> = {};

      for (const key in props) {
        if (key !== "children") {
          signalProps[key] = signal(props[key]);
        }
      }

      return signalProps;
    },
    (props, signalProps) => {
      for (const key in signalProps) {
        signalProps[key][1](props[key]);
      }
    },
    (signalProps) => {
      const storeProps: any = {};

      for (const key in signalProps) {
        storeProps[key] = signalProps[key][0];
      }

      return storeProps;
    },
    signalDebugHooks.onStoreMounted,
  );
}

// The observer context is responsible for keeping track of signals accessed in a component, derived or effect. It
// does this by being set as the currently active ObserverContext in the stack. Any signals setting/getting will register
// to this active ObserverContext. The component/derived/effect then subscribes to the context, which will add the
// context to every signal tracked. When context is notified about a change it will remove itself from current signals
// and notify any subscribers of the context. It is expected that the subscriber(s) of the context will initiate tracking again.
// The subscription to the context can be disposed, which will also remove the context from any tracked signals. This makes
// sure that component/store unmount/disposal will also remove the context from any signals... making it primed for garbage collection
export class ObserverContext {
  // We keep a global reference to the currently active observer context. A component might first create one,
  // then resolving a store with a derived, which adds another, which might consume a derived from an other store,
  // which adds another etc.
  static stack: ObserverContext[] = [];
  static get current(): ObserverContext | undefined {
    return ObserverContext.stack[ObserverContext.stack.length - 1];
  }
  // We need to keep track of what signals are being set/get. The reason is that in an effect you can
  // not both get and set a signal, as observation would trigger the effect again. So in an effect we
  // prevent notifying updates when a signal has both a getter and a setter. This is also used for debugging
  private _getters = new Set<SignalNotifier>();
  private _setters = new Set<SignalNotifier>();
  // An ObserverContext only has one subscriber at any time
  private _subscriber?: () => void;
  public stackTrace = "";
  // Components are using "useSyncExternalStore" which expects a snapshot to indicate a change
  // to the store. We use a simple number for this to trigger reconciliation of a component. We start
  // out with the current as it reflects the current state of all signals
  snapshot = currentSnapshot;

  constructor(public type: "component" | "derived" | "effect") {
    if (signalDebugHooks.onGetValue) {
      this.stackTrace = new Error().stack || "";
    }
    // Use for memory leak debugging
    // registry.register(this, this.id + " has been collected");
  }
  registerGetter(signal: SignalNotifier) {
    // We do not allow having getters when setting a signal, the reason is to ensure
    // no infinite loops
    if (this._setters.has(signal)) {
      return;
    }

    // When a signal is accessed during an ObservationContext scope we add it as a getter
    this._getters.add(signal);
  }
  registerSetter(signal: SignalNotifier) {
    // We do not allow having getters when setting a signal, the reason is to ensure
    // no infinite loops
    if (this._getters.has(signal)) {
      this._getters.delete(signal);
    }

    this._setters.add(signal);
  }
  // When adding a subscriber we ensure that the relevant signals are
  // notifying this ObserverContext of updates. That means when nothing
  // is subscribing to this ObserverContext the instance is free to
  // be garbage collected. React asynchronously subscribes and unsubscribes,
  // but useSyncExternalStore has a mechanism that ensures the validity
  // of the subscription using snapshots
  subscribe(subscriber: () => void) {
    this._subscriber = subscriber;
    this._getters.forEach((signal) => signal.addContext(this));

    return () => {
      this._subscriber = undefined;
      this._getters.forEach((signal) => signal.removeContext(this));
    };
  }

  // When a signal updates it goes through its registered contexts and calls this method.
  // Here we always know that we get the very latest global snapshot as it was just
  // generated. We immediately apply it and React will now reconcile given it is
  // subscribing
  notify(snapshot: number) {
    this.snapshot = snapshot;

    // We clear the tracking information of the ObserverContext when we notify
    // as it should result in a new tracking
    this._getters.forEach((signal) => {
      signal.removeContext(this);
    });
    this._getters.clear();
    this._setters.clear();
    this._subscriber?.();
  }
  // The ObserverContext can be used with explicit resource management
  [Symbol.dispose]() {
    ObserverContext.stack.pop();
  }
}

// This is instantiated by a signal to keep track of what ObsererContexts are interested
// in the signal and notifies them when the signal changes
export class SignalNotifier {
  private contexts = new Set<ObserverContext>();
  constructor() {}
  // A signal holds a global snapshot value, which changes whenever the signal changes.
  // This snapshot is passed and stored on the ObserverContext to make sure
  // React understands that a change has happened
  snapshot = ++currentSnapshot;
  addContext(context: ObserverContext) {
    this.contexts.add(context);
  }
  removeContext(context: ObserverContext) {
    this.contexts.delete(context);
  }
  notify() {
    // Any signal change updates the global snapshot
    this.snapshot = ++currentSnapshot;

    // A context can be synchronously added back to this signal related to firing the signal, which
    // could cause a loop. We only want to notify the current contexts
    const contexts = Array.from(this.contexts);

    contexts.forEach((context) => context.notify(this.snapshot));
  }
}

export type Signal<T> = [
  () => T extends Promise<infer V> ? ObservablePromise<V> : T,
  (
    value:
      | T
      | ((current: T extends Promise<infer V> ? ObservablePromise<V> : T) => T),
  ) => T extends Promise<infer V> ? ObservablePromise<V> : T,
];

export function signal<T>(initialValue: T) {
  // If a signal has a promise we want to abort the current
  // resolving promise if we are changing it to a new one
  let currentAbortController: AbortController | undefined;

  let value =
    initialValue && initialValue instanceof Promise
      ? createObservablePromise(initialValue)
      : initialValue;

  const signalNotifier = new SignalNotifier();

  // This is responsible for creating the observable promise by
  // handling the resolved and rejected state of the initial promise and
  // notifying
  function createObservablePromise(
    promise: Promise<any>,
  ): ObservablePromise<T> {
    currentAbortController?.abort();

    const abortController = (currentAbortController = new AbortController());

    const observablePromise = createPendingPromise(
      promise
        .then(function (resolvedValue) {
          if (abortController.signal.aborted) {
            return;
          }

          value = createFulfilledPromise(
            Promise.resolve(resolvedValue),
            resolvedValue,
          );

          signalNotifier.notify();

          return resolvedValue;
        })
        .catch((rejectedReason) => {
          if (abortController.signal.aborted) {
            return;
          }

          const rejectedPromise = Promise.reject(rejectedReason);

          value = createRejectedPromise(rejectedPromise, rejectedReason);

          signalNotifier.notify();

          return rejectedPromise;
        }),
    );

    observablePromise.catch(() => {
      // When consuming a promise form a signal we do not consider it an unhandled promise anymore.
      // This catch prevents the browser from identifying it as unhandled, but will still be a rejected
      // promise if you try to consume it
    });

    return observablePromise;
  }

  return [
    () => {
      // Consuming a store might resolve it synchronously. During that resolvement we
      // do not want to track access to any signals, only the signals actually consumed
      // in the component function body
      if (
        ObserverContext.current &&
        !isResolvingStoreFromComponent(ObserverContext.current)
      ) {
        ObserverContext.current.registerGetter(signalNotifier);
        if (signalDebugHooks.onGetValue) {
          signalDebugHooks.onGetValue(ObserverContext.current, signalNotifier);
        }
      }

      return value;
    },
    (newValue: any) => {
      // The update signature
      if (typeof newValue === "function") {
        newValue = newValue(value);
      }

      if (newValue instanceof Promise) {
        newValue = createObservablePromise(newValue);
      }

      // We do nothing if the values are the same
      if (value === newValue) {
        return value;
      }

      value = newValue;

      ObserverContext.current?.registerSetter(signalNotifier);

      if (signalDebugHooks.onSetValue) {
        signalDebugHooks.onSetValue(signalNotifier, value);
      }

      if (value instanceof Promise) {
        // A promise could be an already resolved promise, in which case we do not want to notify as it is
        // already done in "createObservablePromise". So we run our own micro task to check if the promise
        // is still pending, where we do want to notify
        Promise.resolve().then(() => {
          if (value instanceof Promise && value.status === "pending") {
            signalNotifier.notify();
          }
        });
      } else {
        signalNotifier.notify();
      }

      return value;
    },
  ] as Signal<T>;
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

// This is the polyfill for the use hook. With React 19 you will use this from React instead
export function use<T>(promise: ObservablePromise<T>): T {
  if (promise.status === "pending") {
    throw promise;
  }

  if (promise.status === "rejected") {
    throw promise.reason;
  }

  return promise.value;
}

export type Derived<T> = () => T;

export function derived<T>(cb: () => T) {
  if (getResolvingStoreContainer() === undefined) {
    throw new Error('You can only run "derived" when creating a store');
  }

  let value: T;

  // We keep track of it being dirty, because we only compute the result
  // of a derived when accessing it and it being dirty. It is lazy
  let isDirty = true;
  let disposer: (() => void) | undefined;
  const signalNotifier = new SignalNotifier();
  const context = new ObserverContext("derived");

  // We clean up the subscription on the derived when disposing the store
  cleanup(() => disposer?.());

  return () => {
    // Again, we do not want to track access to this derived if we are resolving a store
    // from a component and consuming the derived as part of resolving the store
    if (
      ObserverContext.current &&
      !isResolvingStoreFromComponent(ObserverContext.current)
    ) {
      ObserverContext.current.registerGetter(signalNotifier);
      if (signalDebugHooks.onGetValue) {
        signalDebugHooks.onGetValue(ObserverContext.current, signalNotifier);
      }
    }

    if (isDirty) {
      ObserverContext.stack.push(context);

      value = cb();

      ObserverContext.stack.pop();

      // We immediately subscribe to the ObserverContext, which
      // adds this context to the tracked signals
      disposer = context.subscribe(() => {
        // When notified about an update we immediately unsubscribe, as
        // we do not care about any further updates. When the derived is accessed
        // again it is dirty and a new subscription is set up
        disposer?.();
        // We only change the dirty state and notify
        isDirty = true;
        signalNotifier.notify();
      });

      // With a new value calculated it is not dirty anymore
      isDirty = false;

      if (signalDebugHooks.onSetValue) {
        signalDebugHooks.onSetValue(signalNotifier, value, true);
      }
    }

    return value;
  };
}

export function effect(cb: () => void) {
  if (getResolvingStoreContainer() === undefined) {
    throw new Error('You can only run "effect" when creating a store');
  }

  let disposer: (() => void) | void;
  const context = new ObserverContext("effect");

  cleanup(() => disposer?.());

  runEffect();

  function runEffect() {
    disposer?.();

    ObserverContext.stack.push(context);

    cb();

    ObserverContext.stack.pop();

    disposer = context.subscribe(runEffect);

    if (signalDebugHooks.onEffectRun) {
      signalDebugHooks.onEffectRun(cb);
    }
  }
}

// The hook that syncs React with the ObserverContext.
export function observer(): ObserverContext;
export function observer<T>(
  component: FunctionComponent<T>,
): FunctionComponent<T>;
export function observer<T>(component?: FunctionComponent<T>) {
  if (component) {
    return (props: T) => {
      const observer = useObserver();

      try {
        return component(props);
      } finally {
        observer[Symbol.dispose]();
      }
    };
  }

  return useObserver();
}

export function Observer({ children }: { children: () => React.ReactNode }) {
  const context = useObserver();

  try {
    return children();
  } finally {
    context[Symbol.dispose]();
  }
}

export function useObserver() {
  // No reason to set up a ObserverContext on the server
  if (isServer) {
    return {
      [Symbol.dispose]() {},
    };
  }

  const contextObserverRef = useRef<ObserverContext>();

  if (!contextObserverRef.current) {
    contextObserverRef.current = new ObserverContext("component");
  }

  ObserverContext.stack.push(contextObserverRef.current);

  const context = contextObserverRef.current;

  useSyncExternalStore(
    // We subscribe to the context. This only notifies about a change
    (update) => context.subscribe(update),
    // We then grab the current snapshot, which is the global number for any change to any signal,
    // ensuring we'll always get a new snapshot whenever a related signal changes
    () => context.snapshot,
    // Even though Impact is not designed to run on the server, we still give this callback
    // as for example Next JS requires it to be there, even when rendering client only components
    () => context.snapshot,
  );

  return context;
}
