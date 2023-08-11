import { useRef, useSyncExternalStore } from "react";
import { createObserveDebugEntry, createSetterDebugEntry } from "./debugger";
import { produce } from "immer";

import * as CachedPromise from "./CachedPromise";

export type { CachedPromise } from "./CachedPromise";

// @ts-ignore
Symbol.dispose ??= Symbol("Symbol.dispose");

export class ObserverContext {
  static stack: ObserverContext[] = [];
  static get current() {
    return ObserverContext.stack[ObserverContext.stack.length - 1];
  }
  private _signals = new Set<SignalTracker>();
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
  registerSignal(signal: SignalTracker) {
    this._signals.add(signal);

    this._snapshot.signals.push(signal.getValue());
  }
  /**
   * There is only a single subscriber to any ObserverContext
   */
  subscribe(onUpdate: () => void) {
    this._onUpdate = onUpdate;
    this._signals.forEach((signal) => {
      signal.addContext(this);
    });

    return () => {
      this._signals.forEach((signal) => {
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
    this.contexts.forEach((context) => context.notify());
  }
}

export type JSONValue =
  | null
  | string
  | number
  | boolean
  | Array<JSONValue>
  | { [x: string]: JSONValue };

export type Signal<T extends JSONValue> = {
  get(): T;
  set(value: T | ((value: T) => T | void)): T;
  onChange(listener: (newValue: T, prevValue: T) => void): () => void;
  toJSON(): T;
};

export function signal<T extends JSONValue>(value: T) {
  const signal = new SignalTracker(() => value);
  let listeners: Set<(newValue: T, prevValue: T) => void> | undefined;

  return {
    onChange(listener: (newValue: T, prevValue: T) => void) {
      listeners = listeners || new Set();

      listeners.add(listener);

      return () => {
        listeners?.delete(listener);
      };
    },
    get() {
      if (ObserverContext.current) {
        ObserverContext.current.registerSignal(signal);
        if (process.env.NODE_ENV === "development") {
          createObserveDebugEntry(signal);
        }
      }

      return value;
    },
    set(newValue) {
      const prevValue = value;
      value =
        typeof newValue === "function"
          ? produce(prevValue, newValue)
          : newValue;

      if (process.env.NODE_ENV === "development") {
        createSetterDebugEntry(signal, value);
      }

      signal.notify();

      listeners?.forEach((listener) => listener(value, prevValue));

      return value;
    },
    toJSON() {
      return value;
    },
  } as Signal<T>;
}

export type AsyncSignal<T extends JSONValue> = {
  get(): CachedPromise.CachedPromise<T>;
  set(
    value: T | Promise<T> | ((value: T) => T | void)
  ): CachedPromise.CachedPromise<T>;
  onChange(listener: (newValue: T, prevValue: T) => void): () => void;
};

export function asyncSignal<T extends JSONValue>(value: Promise<T>) {
  const signal = new SignalTracker(() => value);
  let listeners: Set<(newValue: T, prevValue: T) => void> | undefined;

  value = CachedPromise.from(value);

  return {
    onChange(listener: (newValue: T, prevValue: T) => void) {
      listeners = listeners || new Set();

      listeners.add(listener);

      return () => {
        listeners?.delete(listener);
      };
    },
    get() {
      if (ObserverContext.current) {
        ObserverContext.current.registerSignal(signal);
        if (process.env.NODE_ENV === "development") {
          createObserveDebugEntry(signal);
        }
      }

      return value;
    },
    set(newValue) {
      const prevValue = value;

      if (typeof newValue === "function") {
        value = prevValue.then((prev) => produce(prev, newValue));
      } else if (newValue instanceof Promise) {
        value = CachedPromise.from(newValue);
      } else {
        value = CachedPromise.fromValue(newValue);
      }

      if (process.env.NODE_ENV === "development") {
        createSetterDebugEntry(signal, value);
      }

      value
        .then((resolvedValue) => {
          prevValue.then((resolvedPrevValue) => {
            listeners?.forEach((listener) =>
              listener(resolvedValue, resolvedPrevValue)
            );
          });
        })
        .finally(() => {
          signal.notify();
        });

      return value;
    },
  } as AsyncSignal<T>;
}

export function compute<T>(cb: () => T) {
  let value: T;
  let disposer: () => void;
  let isDirty = true;
  const signal = new SignalTracker(() => value);
  let listeners: Set<(newValue: T, prevValue: T) => void> | undefined;

  return {
    onChange: (listener: (newValue: T, prevValue: T) => void) => {
      listeners = listeners || new Set();

      listeners.add(listener);

      return () => {
        listeners?.delete(listener);
      };
    },
    get() {
      if (ObserverContext.current) {
        ObserverContext.current.registerSignal(signal);
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

export function observe() {
  const context = new ObserverContext();

  useSyncExternalStore(
    (update) => context.subscribe(update),
    () => context.snapshot
  );

  return context;
}
