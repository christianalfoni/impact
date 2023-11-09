import { useSyncExternalStore } from "react";
import { createObserveDebugEntry, createSetterDebugEntry } from "./debugger";

// @ts-ignore
Symbol.dispose ??= Symbol("Symbol.dispose");

export class ObserverContext {
  static stack: ObserverContext[] = [];
  static get current(): ObserverContext | undefined {
    return ObserverContext.stack[ObserverContext.stack.length - 1];
  }
  private _getters = new Set<SignalTracker>();
  private _setters = new Set<SignalTracker>();
  private _onUpdate?: () => void;
  private _snapshot: { signals: unknown[] } = {
    signals: [],
  };
  get snapshot() {
    return this._snapshot;
  }
  constructor() {
    ObserverContext.stack.push(this);
  }
  registerGetter(signal: SignalTracker) {
    // We do not allow having getters when setting a signal, the reason is to ensure
    // no infinite loops
    if (this._setters.has(signal)) {
      return;
    }

    this._getters.add(signal);
    this._snapshot.signals.push(signal.getValue());
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
  notify() {
    this._snapshot = {
      ...this._snapshot,
    };
    this._onUpdate?.();
  }
  [Symbol.dispose]() {
    ObserverContext.stack.pop();
  }
}

export class SignalTracker {
  private contexts = new Set<ObserverContext>();
  constructor(public getValue: () => unknown) {}
  addContext(context: ObserverContext) {
    this.contexts.add(context);
  }
  removeContext(context: ObserverContext) {
    this.contexts.delete(context);
  }
  notify() {
    // A context can be synchronously added back to this signal related to firing the signal, which
    // could cause a loop. We only want to notify the current contexts
    const contexts = Array.from(this.contexts);
    contexts.forEach((context) => context.notify());
  }
}

export type Signal<T> = T extends Promise<infer V>
  ? {
      get value(): PromiseSignal<V>;
      set value(promise: T);
    }
  : {
      value: T;
    };

export function signal<T>(): Signal<T | undefined>;
export function signal<T>(initialValue: T): Signal<T>;
export function signal<T>(initialValue?: T) {
  let currentAbortController: AbortController | undefined;

  let value =
    initialValue && initialValue instanceof Promise
      ? createPromise(initialValue)
      : initialValue;

  const signal = new SignalTracker(() => value);

  function createPromise(promise: Promise<any>): PromiseSignal<T> {
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
      if (ObserverContext.current) {
        ObserverContext.current.registerGetter(signal);
        if (process.env.NODE_ENV === "development") {
          createObserveDebugEntry(signal);
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

      if (process.env.NODE_ENV === "development") {
        createSetterDebugEntry(signal, value);
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
  };
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

type PromiseSignal<T> =
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

export function use<T>(promise: PromiseSignal<T>): T {
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
  let listeners: Set<(newValue: T, prevValue: T) => void> | undefined;

  return {
    get value() {
      if (ObserverContext.current) {
        ObserverContext.current.registerGetter(signal);
        if (process.env.NODE_ENV === "development") {
          createObserveDebugEntry(signal);
        }
      }

      if (isDirty) {
        disposer?.();

        const context = new ObserverContext();

        value = cb();

        // @ts-ignore
        context[Symbol.dispose]();

        disposer = context.subscribe(() => {
          isDirty = true;

          const prevValue = value;

          if (listeners?.size) {
            isDirty = false;
            value = cb();
          }

          signal.notify();

          listeners?.forEach((listener) => listener(value, prevValue));
        });

        isDirty = false;

        if (process.env.NODE_ENV === "development") {
          createSetterDebugEntry(signal, value, true);
        }
      }

      return value;
    },
  };
}

export function effect(cb: () => void) {
  let currentSubscriptionDisposer: (() => void) | undefined;

  const updater = () => {
    currentSubscriptionDisposer?.();
    const context = new ObserverContext();
    cb();
    context[Symbol.dispose]();
    currentSubscriptionDisposer = context.subscribe(updater);
  };

  updater();

  return () => {
    currentSubscriptionDisposer?.();
  };
}

export function observer() {
  const context = new ObserverContext();

  useSyncExternalStore(
    (update) => context.subscribe(update),
    () => context.snapshot,
    () => context.snapshot,
  );

  return context;
}

/*
  - 
*/
