import { useEffect, useState } from "react";

class ObserverContext {
  private disposeListeners = new Set<() => void>();
  private subscribeListeners = new Set<() => void>();
  constructor(private update: (update: (current: number) => number) => void) {}
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
    this.update((current) => current + 1);
  }
}

let observerContext: ObserverContext | undefined;

function observe(fn: (...args: any[]) => any, ...args: any[]) {
  const [_, setState] = useState(0);
  const context = (observerContext = new ObserverContext(setState));
  try {
    useEffect(() => context.subscribe());
    const result = fn(...args);
    observerContext = undefined;
    return result;
  } catch (error) {
    observerContext = undefined;
    throw error;
  }
}

/**
 * Wrap a component to track any signal consumed
 */
export function observer<T extends (...args: any[]) => any>(component: T): T {
  return ((...args: unknown[]) => observe(component, ...args)) as T;
}

/**
 * Return this hook from a component, creating the JSX and consuming any signals
 */
export function useSignals<T extends () => any>(fn: T) {
  return observe(fn);
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
