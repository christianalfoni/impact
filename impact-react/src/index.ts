import { FunctionComponent, useRef, useSyncExternalStore } from "react";
import { produce } from "immer";

/**
 * ### STORE ###
 */

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
  (): T extends Promise<infer V> ? ObservablePromise<V> : T;
  (value: T): T extends Promise<infer V> ? ObservablePromise<V> : T;
  (
    update: (current: T) => T | void,
  ): T extends Promise<infer V> ? ObservablePromise<V> : T;
};

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

  return ((...args: any[]) => {
    if (!args.length) {
      if (ObserverContext.current) {
        ObserverContext.current.registerGetter(signal);
        if (signalDebugHooks.onGetValue) {
          signalDebugHooks.onGetValue(ObserverContext.current, signal);
        }
      }

      return value;
    }

    let newValue = args[0];

    if (typeof newValue === "function") {
      newValue = produce(value, newValue);
    }

    if (value === newValue) {
      return value;
    }

    if (newValue instanceof Promise) {
      newValue = createPromise(newValue);
    }

    value = newValue;

    if (signalDebugHooks.onSetValue) {
      signalDebugHooks.onSetValue(signal, value);
      ObserverContext.current?.registerSetter(signal);
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

    return value;
  }) as Signal<T>;
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

  return () => {
    if (ObserverContext.current?.type === "component") {
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

  return currentSubscriptionDisposer;
}

export function observe<T>(
  component: FunctionComponent<T>,
): FunctionComponent<T> {
  return (props: T) => {
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

    try {
      return component(props);
    } finally {
      context.pop();
    }
  };
}
