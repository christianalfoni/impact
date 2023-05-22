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
    this.subscribeListeners.forEach((cb) => cb());
    return () => {
      this.disposeListeners.forEach((cb) => cb());
    };
  }
  notify() {
    this.update((current) => current + 1);
  }
}

let observerContext: ObserverContext | undefined;

export function observer<T extends (...args: any[]) => any>(component: T): T {
  return ((...args: unknown[]) => {
    // Suspense
    const [_, setState] = useState(0);
    const context = (observerContext = new ObserverContext(setState));
    try {
      useEffect(() => context.subscribe());
      const result = component(...args);
      observerContext = undefined;
      return result;
    } catch (error) {
      observerContext = undefined;
      throw error;
    }
  }) as T;
}

export const useObserver = <T>(observerCb: () => T) => observer(observerCb);

const observableMetadataKey = Symbol("observable");

export function observable(...args: any[]) {
  const descriptor = args[2] as {
    initializer?: () => unknown;
    configurable: boolean;
    enumerable: boolean;
  };

  const getMetaData = (target: unknown) => {
    // @ts-ignore
    const metadata = Reflect.getOwnMetadata(
      observableMetadataKey,
      target,
      args[1]
    ) || {
      value: descriptor.initializer ? descriptor.initializer() : undefined,
      subscribers: new Set<ObserverContext>(),
    };

    // @ts-ignore
    Reflect.defineMetadata(observableMetadataKey, metadata, target, args[1]);

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
      metadata.subscribers.forEach((context) => context.notify());

      // @ts-ignore
      Reflect.defineMetadata(observableMetadataKey, metadata, this, args[1]);
    },
    configurable: descriptor.configurable,
    enumerable: descriptor.enumerable,
  } as any;
}
