import { Context, context } from "./context";
import { Signal, derived, signal } from "./signal";

export function store<T, A extends Record<string, unknown> | void>(
  store: Context<T, A>,
): (() => T) & {
  Provider: React.FC<A & { children: React.ReactNode }>;
  provide: <T>(component: React.FC<T>) => React.FC<A & T>;
};
export function store<S extends Record<string, unknown>>(
  initialStore: S,
): {
  readonly [K in keyof S]: S[K] extends (...params: any[]) => any
    ? (this: S, ...params: Parameters<S[K]>) => ReturnType<S[K]>
    : Signal<S[K]>["value"];
};
export function store(store: any) {
  if (typeof store === "function") {
    return context(store);
  }

  return context(() => createStore(store));
}

function createStore<S extends Record<string, unknown>>(initialStore: S) {
  /**
   * STATE
   */
  const signals: Record<string, Signal<unknown>> = {};
  const readonlyStore: Record<string, unknown> = {};
  const store: Record<string, unknown> = {};
  const descriptors = Object.getOwnPropertyDescriptors(initialStore);
  for (const key in descriptors) {
    const descriptor = Object.getOwnPropertyDescriptor(initialStore, key)!;

    if ("value" in descriptor && typeof descriptor.value === "function") {
      readonlyStore[key] = (...params: any[]) =>
        descriptor.value.apply(store, params);
      store[key] = readonlyStore[key];
    } else if ("value" in descriptor) {
      signals[key] = signal(descriptor.value);
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
    } else if ("get" in descriptor && typeof descriptor.get === "function") {
      signals[key] = derived(descriptor.get.bind(readonlyStore));
      Object.defineProperty(readonlyStore, key, {
        get() {
          return signals[key].value;
        },
      });
      Object.defineProperty(store, key, {
        get() {
          return signals[key].value;
        },
      });
    } else {
      console.warn(
        `Not able to signalify the key "${key}" in store`,
        initialStore,
      );
    }
  }

  return readonlyStore as unknown as {
    readonly [K in keyof S]: S[K] extends (...params: any[]) => any
      ? (this: S, ...params: Parameters<S[K]>) => ReturnType<S[K]>
      : Signal<S[K]>["value"];
  };
}
