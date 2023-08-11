type TPendingSuspensePromise<T> = Promise<T> & {
  status: "pending";
  use(): T;
};

type TFulfilledSuspensePromise<T> = Promise<T> & {
  status: "fulfilled";
  value: T;
  use(): T;
};

type TRejectedSuspensePromise = Promise<never> & {
  status: "rejected";
  reason: unknown;
  use(): never;
};

export type SuspensePromise<T> =
  | TPendingSuspensePromise<T>
  | TFulfilledSuspensePromise<T>
  | TRejectedSuspensePromise;

// There is an official RFC for this hook: https://github.com/reactjs/rfcs/pull/229
function use<T>(promise: SuspensePromise<T>) {
  if (isFulfilledSuspensePromise(promise)) {
    return promise.value as T;
  }

  if (isRejectedSuspensePromise(promise)) {
    throw promise.reason;
  }

  promise
    .then((value) => {
      makePromiseFulfilledSuspensePromise(promise, value);
    })
    .catch((reason) => {
      makePromiseRejectedSuspensePromise(promise, reason);
    });

  throw makePromisePendingSuspensePromise(promise);
}

function makePromiseFulfilledSuspensePromise<T>(promise: Promise<T>, value: T) {
  return Object.assign(promise, {
    status: "fulfilled",
    value,
    use: () => use(promise as TFulfilledSuspensePromise<T>),
  }) as TFulfilledSuspensePromise<T>;
}

function makePromiseRejectedSuspensePromise(
  promise: Promise<unknown>,
  reason: unknown
) {
  return Object.assign(promise, {
    status: "rejected",
    reason,
    use: () => use(promise as TRejectedSuspensePromise),
  }) as TRejectedSuspensePromise;
}

function makePromisePendingSuspensePromise<T>(promise: Promise<T>) {
  return Object.assign(promise, {
    status: "pending",
    use: () => use(promise as TPendingSuspensePromise<T>),
  }) as TPendingSuspensePromise<T>;
}

function isFulfilledSuspensePromise(
  promise: unknown
): promise is TFulfilledSuspensePromise<unknown> {
  return (
    promise instanceof Promise &&
    "status" in promise &&
    "value" in promise &&
    promise.status === "fulfilled"
  );
}

function isRejectedSuspensePromise(
  promise: unknown
): promise is TRejectedSuspensePromise {
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
      makePromiseFulfilledSuspensePromise(nativePromise, value);
    })
    .catch((reason) => {
      makePromiseRejectedSuspensePromise(nativePromise, reason);
    });

  return makePromisePendingSuspensePromise(nativePromise);
}

export function resolve<T>(value: T) {
  return makePromiseFulfilledSuspensePromise(Promise.resolve(value), value);
}
