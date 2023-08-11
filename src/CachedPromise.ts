type TPendingCachedPromise<T> = Promise<T> & {
  status: "pending";
  use(): T;
};

type TFulfilledCachedPromise<T> = Promise<T> & {
  status: "fulfilled";
  value: T;
  use(): T;
};

type TRejectedCachedPromise = Promise<never> & {
  status: "rejected";
  reason: unknown;
  use(): never;
};

export type CachedPromise<T> =
  | TPendingCachedPromise<T>
  | TFulfilledCachedPromise<T>
  | TRejectedCachedPromise;

// There is an official RFC for this hook: https://github.com/reactjs/rfcs/pull/229
function use<T>(promise: CachedPromise<T>) {
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

function makePromiseFulfilledCachedPromise<T>(promise: Promise<T>, value: T) {
  return Object.assign(promise, {
    status: "fulfilled",
    value,
    use: () => use(promise as TFulfilledCachedPromise<T>),
  }) as TFulfilledCachedPromise<T>;
}

function makePromiseRejectedCachedPromise(
  promise: Promise<unknown>,
  reason: unknown
) {
  return Object.assign(promise, {
    status: "rejected",
    reason,
    use: () => use(promise as TRejectedCachedPromise),
  }) as TRejectedCachedPromise;
}

function makePromisePendingCachedPromise<T>(promise: Promise<T>) {
  return Object.assign(promise, {
    status: "pending",
    use: () => use(promise as TPendingCachedPromise<T>),
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

export function from<T>(nativePromise: Promise<T>) {
  nativePromise
    .then((value) => {
      makePromiseFulfilledCachedPromise(nativePromise, value);
    })
    .catch((reason) => {
      makePromiseRejectedCachedPromise(nativePromise, reason);
    });

  return makePromisePendingCachedPromise(nativePromise);
}

export function fromValue<T>(value: T) {
  return makePromiseFulfilledCachedPromise(Promise.resolve(value), value);
}
