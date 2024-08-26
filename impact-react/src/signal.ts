import { getResolvingStoreContainer } from "impact-react-store";
import { ObserverContext, SignalNotifier } from "./ObserverContext";
import { debugHooks } from "./debugHooks";
import { isResolvingStoreFromComponent } from "./utils";

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

function createPendingPromise<T>(promise: Promise<T>): PendingPromise<T> {
  return Object.assign(promise, {
    status: "pending" as const,
  });
}

function createFulfilledPromise<T>(
  promise: Promise<T>,
  value: T,
): FulfilledPromise<T> {
  return Object.assign(promise, {
    status: "fulfilled" as const,
    value,
  });
}

function createRejectedPromise<T>(
  promise: Promise<T>,
  reason: unknown,
): RejectedPromise<T> {
  return Object.assign(promise, {
    status: "rejected" as const,
    reason,
  });
}

export type Signal<T> = [
  () => T extends Promise<infer V> ? ObservablePromise<V> : T,
  (
    value:
      | T
      | ((current: T extends Promise<infer V> ? ObservablePromise<V> : T) => T),
  ) => T extends Promise<infer V> ? ObservablePromise<V> : T,
];

export function signal<T>(initialValue: T) {
  // If a signal has a promise we want to abort the current
  // resolving promise if we are changing it to a new one
  let currentAbortController: AbortController | undefined;

  let value =
    initialValue && initialValue instanceof Promise
      ? createObservablePromise(initialValue)
      : initialValue;

  const signalNotifier = new SignalNotifier();

  // This is responsible for creating the observable promise by
  // handling the resolved and rejected state of the initial promise and
  // notifying
  function createObservablePromise(
    promise: Promise<any>,
  ): ObservablePromise<T> {
    currentAbortController?.abort();

    const abortController = (currentAbortController = new AbortController());

    const observablePromise = createPendingPromise(
      promise
        .then(function (resolvedValue) {
          if (abortController.signal.aborted) {
            return;
          }

          value = createFulfilledPromise(
            Promise.resolve(resolvedValue),
            resolvedValue,
          );

          signalNotifier.notify();

          return resolvedValue;
        })
        .catch((rejectedReason) => {
          if (abortController.signal.aborted) {
            return;
          }

          const rejectedPromise = Promise.reject(rejectedReason);

          value = createRejectedPromise(rejectedPromise, rejectedReason);

          signalNotifier.notify();

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

  return [
    () => {
      // Consuming a store might resolve it synchronously. During that resolvement we
      // do not want to track access to any signals, only the signals actually consumed
      // in the component function body
      if (
        ObserverContext.current &&
        !isResolvingStoreFromComponent(ObserverContext.current)
      ) {
        ObserverContext.current.registerGetter(signalNotifier);
        if (debugHooks.onGetValue) {
          debugHooks.onGetValue(ObserverContext.current, signalNotifier);
        }
      }

      return value;
    },
    (newValue: any) => {
      // The update signature
      if (typeof newValue === "function") {
        newValue = newValue(value);
      }

      if (newValue instanceof Promise) {
        newValue = createObservablePromise(newValue);
      }

      // We do nothing if the values are the same
      if (value === newValue) {
        return value;
      }

      value = newValue;

      ObserverContext.current?.registerSetter(signalNotifier);

      if (debugHooks.onSetValue) {
        debugHooks.onSetValue(signalNotifier, value);
      }

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
