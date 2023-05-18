type TPendingCachedPromise<T> = Promise<T> & {
  status: "pending";
};

type TFulfilledCachedPromise<T> = Promise<T> & {
  status: "fulfilled";
  value: T;
};

type TRejectedCachedPromise = Promise<never> & {
  status: "rejected";
  reason: unknown;
};

export type CachedPromise<T> =
  | TPendingCachedPromise<T>
  | TFulfilledCachedPromise<T>
  | TRejectedCachedPromise;

export const CachedPromise = {
  from: <T>(promise: Promise<T>) => {
    promise
      .then((value) => {
        makePromiseFulfilledCachedPromise(promise, value);
      })
      .catch((reason) => {
        makePromiseRejectedCachedPromise(promise, reason);
      });

    return makePromisePendingCachedPromise(promise);
  },
  fulfilled: <T>(value: T) => {
    const promise = Promise.resolve(value);

    return makePromiseFulfilledCachedPromise(promise, value);
  },
  rejected: (reason: unknown) => {
    const promise = Promise.reject(reason);

    return makePromiseRejectedCachedPromise(promise, reason);
  },
};

function makePromiseFulfilledCachedPromise<T>(promise: Promise<T>, value: T) {
  return Object.assign(promise, {
    status: "fulfilled",
    value,
  }) as TFulfilledCachedPromise<T>;
}

function makePromiseRejectedCachedPromise(
  promise: Promise<unknown>,
  reason: unknown
) {
  return Object.assign(promise, {
    status: "rejected",
    reason,
  }) as TRejectedCachedPromise;
}

function makePromisePendingCachedPromise<T>(promise: Promise<T>) {
  return Object.assign(promise, {
    status: "pending",
  }) as TPendingCachedPromise<T>;
}

function isFulfilledCachedPromise(
  promise: unknown
): promise is TFulfilledCachedPromise<unknown> {
  return (
    promise instanceof Promise &&
    "status" in promise &&
    "value" in promise &&
    promise.status === "fulfilled"
  );
}

function isRejectedCachedPromise(
  promise: unknown
): promise is TRejectedCachedPromise {
  return (
    promise instanceof Promise &&
    "status" in promise &&
    "reason" in promise &&
    promise.status === "rejected"
  );
}

// There is an official RFC for this hook: https://github.com/reactjs/rfcs/pull/229
export function use<T>(promise: CachedPromise<T>) {
  if (isFulfilledCachedPromise(promise)) {
    return promise.value as T;
  }

  if (isRejectedCachedPromise(promise)) {
    throw promise.reason;
  }

  promise
    .then((value) => {
      makePromiseFulfilledCachedPromise(promise, value);
    })
    .catch((reason) => {
      makePromiseRejectedCachedPromise(promise, reason);
    });

  throw makePromisePendingCachedPromise(promise);
}
