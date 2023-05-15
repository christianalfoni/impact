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
      subscribers: new Set(),
    };

    // @ts-ignore
    Reflect.defineMetadata(observableMetadataKey, metadata, target, args[1]);

    return metadata as {
      value: unknown;
      subscribers: Set<(value: unknown) => void>;
    };
  };

  return {
    get() {
      const metadata = getMetaData(this);

      if (isTracking) {
        const state = useSyncExternalStore(
          (updateStore) => {
            metadata.subscribers.add(updateStore);

            return () => {
              metadata.subscribers.delete(updateStore);
            };
          },
          () => metadata.value
        );

        return state;
      }

      return metadata.value;
    },
    set(newValue: unknown) {
      const metadata = getMetaData(this);
      metadata.value = newValue;

      metadata.subscribers.forEach((cb) => cb(newValue));
      // @ts-ignore
      Reflect.defineMetadata(observableMetadataKey, metadata, this, args[1]);
    },
    configurable: descriptor.configurable,
    enumerable: descriptor.enumerable,
  };
}
