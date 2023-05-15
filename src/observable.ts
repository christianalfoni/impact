import { useSyncExternalStore } from "react";

let isTracking = false;
export function observer<T extends (...args: any[]) => any>(component: T): T {
  return ((...args: unknown[]) => {
    isTracking = true;
    // Suspense
    try {
      const result = component(...args);
      isTracking = false;
      return result;
    } catch (error) {
      isTracking = false;
      throw error;
    }
  }) as T;
}

export function observable(...args: any[]) {
  const descriptor = args[2] as {
    initializer: () => unknown;
    configurable: boolean;
    enumerable: boolean;
  };

  let value = descriptor.initializer();
  const subscribers = new Set<(value: unknown) => void>();

  const useObserver = () => {
    const state = useSyncExternalStore(
      (updateStore) => {
        subscribers.add(updateStore);

        return () => {
          subscribers.delete(updateStore);
        };
      },
      () => value
    );

    return state;
  };

  return {
    get() {
      if (isTracking) {
        return useObserver();
      }

      return value;
    },
    set(newValue: unknown) {
      value = newValue;
      subscribers.forEach((cb) => cb(value));
    },
    configurable: descriptor.configurable,
    enumerable: descriptor.enumerable,
  } as any;
}
