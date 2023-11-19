import { Signal, signal } from "impact-signal";

export function store<T extends Record<string, unknown>>(config: T) {
  const signals: Record<string, Signal<unknown>> = {};
  const proxy: Record<any, unknown> = {};

  for (const key in config) {
    const value = config[key];

    if (typeof value === "function") {
      proxy[key] = value.bind(proxy);
    } else {
      signals[key] = signal(value);
      Object.defineProperty(proxy, key, {
        get() {
          return signals[key].value;
        },
      });
    }
  }

  return proxy as {
    readonly [K in keyof T]: T[K] extends (...params: any[]) => any
      ? T[K]
      : Signal<T[K]>["value"];
  };
}
