export * from "./Container";
export * from "./observable";

const RESOLVED_PROMISE = Symbol("RESOLVED_PROMISE_SYMBOL");
const REJECTED_PROMISE = Symbol("REJECTED_PROMISE_SYMBOL");

// There is an official RFC for this hook: https://github.com/reactjs/rfcs/pull/229
export function use<T extends unknown>(promise: Promise<T>) {
  if (RESOLVED_PROMISE in promise) {
    return promise[RESOLVED_PROMISE] as T;
  }

  if (REJECTED_PROMISE in promise) {
    throw promise[REJECTED_PROMISE];
  }

  promise
    .then((result) => {
      Object.assign(promise, {
        [RESOLVED_PROMISE]: result,
      });
    })
    .catch((error) => {
      Object.assign(promise, {
        [REJECTED_PROMISE]: error,
      });
    });

  throw promise;
}
