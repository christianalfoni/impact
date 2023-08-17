type TPendingSuspensePromise<T> = {
  status: "pending";
};

type TFulfilledSuspensePromise<T> = {
  status: "fulfilled";
  value: T;
};

type TRejectedSuspensePromise = {
  status: "rejected";
  reason: unknown;
};

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

export class SuspensePromise<T> extends Promise<T> {
  static from<T>(nativePromise: Promise<T>): SuspensePromise<T> {
    const promise = new SuspensePromise<T>((resolve, reject) =>
      nativePromise
        .then((value) => {
          promise.status = "fulfilled";
          promise.value = value;
          resolve(value);
        })
        .catch((reason) => {
          promise.status = "rejected";
          promise.reason = reason;
          reject(reason);
        })
    );

    return promise;
  }
  static fromValue<T>(value: T): SuspensePromise<T> {
    const promise = new SuspensePromise<T>((resolve) => resolve(value));

    promise.status = "fulfilled";
    promise.value = value;

    return promise;
  }
  protected status: (
    | TPendingSuspensePromise<T>
    | TFulfilledSuspensePromise<T>
    | TRejectedSuspensePromise
  )["status"] = "pending";
  protected value?: T;
  protected reason?: unknown;
  // There is an official RFC for this hook: https://github.com/reactjs/rfcs/pull/229
  use() {
    if (isFulfilledSuspensePromise(this)) {
      return this.value as T;
    }

    if (isRejectedSuspensePromise(this)) {
      throw this.reason;
    }

    throw this;
  }
}
