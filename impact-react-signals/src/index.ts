import { cleanup, context } from "@impact-react/reactive-context";
import { ObservablePromise } from "./signal";

export { cleanup, context };
export { Observer, observer, useObserver } from "./observers";
export { debugHooks } from "./debugHooks";
export { createReactiveContext } from "./reactiveContext";
export { effect } from "./effect";
export { signal } from "./signal";
export type { Signal } from "./signal";
export { derived } from "./derived";
export { ObserverContext, SignalNotifier } from "./ObserverContext";
export type { ObserverContextType } from "./ObserverContext";
export { query } from "./query";
export type { Query } from "./query";
export { mutation } from "./mutation";
export type { Mutation } from "./mutation";

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