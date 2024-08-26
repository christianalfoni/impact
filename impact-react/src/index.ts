import { cleanup, receiver, emitter } from "impact-react-store";
import { ObservablePromise } from "./signal";

export { cleanup, receiver, emitter };
export { Observer, observer, useObserver } from "./observers";
export { debugHooks } from "./debugHooks";
export { createStore } from "./store";
export { effect } from "./effect";
export { signal, Signal } from "./signal";
export { derived } from "./derived";
export { ObserverContextType } from "./ObserverContext";

// This is the polyfill for the use hook. With React 19 you will use this from React instead
export function use<T>(promise: ObservablePromise<T>): T {
  if (promise.status === "pending") {
    throw promise;
  }

  if (promise.status === "rejected") {
    throw promise.reason;
  }

  return promise.value;
}
