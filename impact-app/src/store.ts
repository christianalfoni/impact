import { Signal, signal } from "./signal";

export function store<S extends Record<string, unknown>>(initialStore: S) {
  /**
   * STATE
   */
  const signals: Record<string, Signal<unknown>> = {};
  const readonlyStore: Record<string, unknown> = {};
  const store: Record<string, unknown> = {};

  for (const key in initialStore) {
    const value = initialStore[key];

    if (typeof value === "function") {
      readonlyStore[key] = (...params: any[]) => value.apply(store, params);
      store[key] = readonlyStore[key];
    } else {
      signals[key] = signal(value);
      Object.defineProperty(readonlyStore, key, {
        get() {
          return signals[key].value;
        },
      });
      Object.defineProperty(store, key, {
        get() {
          return signals[key].value;
        },
        set(v) {
          return (signals[key].value = v);
        },
      });
    }
  }

  return readonlyStore as unknown as {
    readonly [K in keyof S]: S[K] extends (...params: any[]) => any
      ? (this: S, ...params: Parameters<S[K]>) => ReturnType<S[K]>
      : Signal<S[K]>["value"];
  };
}
