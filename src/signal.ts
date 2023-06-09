import { useEffect, useState, useMemo } from "react";

class ObserverContext {
  private disposeListeners = new Set<() => void>();
  private subscribeListeners = new Set<() => void>();
  constructor(private update: () => void) {}
  onSubscribe(cb: () => void) {
    this.subscribeListeners.add(cb);
  }
  onDisposed(cb: () => void) {
    this.disposeListeners.add(cb);
  }
  subscribe() {
    const subscribeListeners = Array.from(this.subscribeListeners);
    subscribeListeners.forEach((cb) => cb());
    return () => {
      const disposeListeners = Array.from(this.disposeListeners);
      disposeListeners.forEach((cb) => cb());
    };
  }
  notify() {
    this.update();
  }
}

let observerContext: ObserverContext | undefined;

function observe(fn: (...args: any[]) => any, deps?: any[]) {
  const [version, setState] = useState(0);

  const context = (observerContext = new ObserverContext(() =>
    setState((current) => current + 1)
  ));

  const result = deps ? useMemo(() => fn(), [version, ...deps]) : fn();

  useEffect(() => context.subscribe());

  observerContext = undefined;

  return result;
}

/**
 * Wrap a component to track any signal consumed
 */
export function observer<T extends (...args: any[]) => any>(component: T): T {
  return ((...args: unknown[]) => observe(() => component(...args))) as T;
}

/**
 * Use this hook to produce a result tracking signals. Typically used when defining the
 * React elements returned from a component, but can also be used to memoize by passing
 * an empty array or related dependendent values in the array
 */
export function useSignals<T extends () => any>(fn: T, deps?: any[]) {
  return observe(fn, deps);
}

const signalMetadataKey = Symbol("observable");

export function signal(...args: any[]) {
  const descriptor = args[2] as {
    initializer?: () => unknown;
    configurable: boolean;
    enumerable: boolean;
  };

  const getMetaData = (target: unknown) => {
    // @ts-ignore
    const metadata = Reflect.getOwnMetadata(
      signalMetadataKey,
      target,
      args[1]
    ) || {
      value: descriptor.initializer ? descriptor.initializer() : undefined,
      subscribers: new Set<ObserverContext>(),
    };

    // @ts-ignore
    Reflect.defineMetadata(signalMetadataKey, metadata, target, args[1]);

    return metadata as {
      value: unknown;
      subscribers: Set<ObserverContext>;
    };
  };

  return {
    get() {
      const metadata = getMetaData(this);

      if (observerContext) {
        const context = observerContext;

        observerContext.onSubscribe(() => {
          metadata.subscribers.add(context);
        });
        observerContext.onDisposed(() => {
          metadata.subscribers.delete(context);
        });
      }

      return metadata.value;
    },
    set(newValue: unknown) {
      const metadata = getMetaData(this);

      metadata.value = newValue;

      const subscribers = Array.from(metadata.subscribers);
      subscribers.forEach((context) => context.notify());

      // @ts-ignore
      Reflect.defineMetadata(signalMetadataKey, metadata, this, args[1]);
    },
    configurable: descriptor.configurable,
    enumerable: descriptor.enumerable,
  } as any;
}
