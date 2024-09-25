import { ObserverContext, SignalNotifier } from "./ObserverContext";

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

export type ObservablePromise<T> =
  | PendingPromise<T>
  | FulfilledPromise<T>
  | RejectedPromise<T>;

export function createPendingPromise<T>(
  promise: Promise<T>,
): PendingPromise<T> {
  return Object.assign(promise, {
    status: "pending" as const,
  });
}

export function createFulfilledPromise<T>(
  promise: Promise<T>,
  value: T,
): FulfilledPromise<T> {
  return Object.assign(promise, {
    status: "fulfilled" as const,
    value,
  });
}

export function createRejectedPromise<T>(
  promise: Promise<T>,
  reason: unknown,
): RejectedPromise<T> {
  return Object.assign(promise, {
    status: "rejected" as const,
    reason,
  });
}

// This is responsible for creating the observable promise by
// handling the resolved and rejected state of the initial promise and
// notifying
export function createObservablePromise<T>(
  promise: Promise<any>,
  abortController: AbortController,
  onSettled: (promise: FulfilledPromise<T> | RejectedPromise<T>) => void,
): ObservablePromise<T> {
  const observablePromise = createPendingPromise(
    promise
      .then(function (resolvedValue) {
        if (abortController.signal.aborted) {
          return;
        }

        onSettled(
          createFulfilledPromise(Promise.resolve(resolvedValue), resolvedValue),
        );

        return resolvedValue;
      })
      .catch((rejectedReason) => {
        if (abortController.signal.aborted) {
          return;
        }

        const rejectedPromise = Promise.reject(rejectedReason);

        onSettled(createRejectedPromise(rejectedPromise, rejectedReason));

        return rejectedPromise;
      }),
  );

  observablePromise.catch(() => {
    // When consuming a promise form a signal we do not consider it an unhandled promise anymore.
    // This catch prevents the browser from identifying it as unhandled, but will still be a rejected
    // promise if you try to consume it
  });

  return observablePromise;
}

export type Signal<T> = [
  () => T extends Promise<infer V> ? ObservablePromise<V> : T,
  <U extends T>(
    value:
      | U
      | ((current: T extends Promise<infer V> ? ObservablePromise<V> : T) => U),
  ) => U extends Promise<infer V> ? ObservablePromise<V> : U,
];

export function signal<T>(initialValue: T) {
  // If a signal has a promise we want to abort the current
  // resolving promise if we are changing it to a new one
  let currentAbortController: AbortController | undefined;

  let value =
    initialValue && initialValue instanceof Promise
      ? createSignalPromise(initialValue)
      : initialValue;

  const signalNotifier = new SignalNotifier();

  // This is responsible for creating the observable promise by
  // handling the resolved and rejected state of the initial promise and
  // notifying
  function createSignalPromise(promise: Promise<any>): ObservablePromise<T> {
    currentAbortController?.abort();

    const abortController = (currentAbortController = new AbortController());

    return createObservablePromise(
      promise,
      abortController,
      (settledObservablePromise) => {
        value = settledObservablePromise;
        signalNotifier.notify();
      },
    );
  }

  return [
    () => {
      if (ObserverContext.current) {
        ObserverContext.current.registerGetter(signalNotifier);
      }

      return value;
    },
    (newValue: any) => {
      // The update signature
      if (typeof newValue === "function") {
        newValue = newValue(value);
      }

      if (newValue instanceof Promise) {
        newValue = createSignalPromise(newValue);
      }

      // We do nothing if the values are the same
      if (value === newValue) {
        return value;
      }

      value = newValue;

      ObserverContext.current?.registerSetter(signalNotifier);

      if (value instanceof Promise) {
        // A promise could be an already resolved promise, in which case we do not want to notify as it is
        // already done in "createObservablePromise". So we run our own micro task to check if the promise
        // is still pending, where we do want to notify
        Promise.resolve().then(() => {
          if (value instanceof Promise && value.status === "pending") {
            signalNotifier.notify();
          }
        });
      } else {
        signalNotifier.notify();
      }

      return value;
    },
  ] as Signal<T>;
}
