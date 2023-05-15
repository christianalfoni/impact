export * from "./Container";
export * from "./Observable";

const RESOLVED_PROMISE_SYMBOL = Symbol("RESOLVED_PROMISE_SYMBOL");
const REJECTED_PROMISE_SYMBOL = Symbol("REJECTED_PROMISE_SYMBOL");

// There is an official RFC for this hook: https://github.com/reactjs/rfcs/pull/229
export function use<T extends unknown>(promise: Promise<T>) {
  if (RESOLVED_PROMISE_SYMBOL in promise) {
    return promise[RESOLVED_PROMISE_SYMBOL] as T;
  }

  if (REJECTED_PROMISE_SYMBOL in promise) {
    throw promise[REJECTED_PROMISE_SYMBOL];
  }

  promise
    .then((result) => {
      Object.assign(promise, {
        [RESOLVED_PROMISE_SYMBOL]: result,
      });
    })
    .catch((error) => {
      Object.assign(promise, {
        [REJECTED_PROMISE_SYMBOL]: error,
      });
    });

  throw promise;
}
