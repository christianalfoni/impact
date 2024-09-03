import React, { FunctionComponent, useRef, useSyncExternalStore } from "react";
import { ObserverContext } from "./ObserverContext";

// When on server we drop out of using "useSyncExternalStore" as there is really no
// reason to run it (It holds no state, just subscribes to updates)
const isServer = typeof window === "undefined";

// The hook that syncs React with the ObserverContext.
export function observer(): ObserverContext;
export function observer<T>(
  component: FunctionComponent<T>,
): FunctionComponent<T>;
export function observer<T>(component?: FunctionComponent<T>) {
  if (component) {
    return (props: T) => {
      const observer = useObserver();

      try {
        return component(props);
      } finally {
        observer[Symbol.dispose]();
      }
    };
  }

  return useObserver();
}

export function Observer({ children }: { children: () => React.ReactNode }) {
  const context = useObserver();

  try {
    return children();
  } finally {
    context[Symbol.dispose]();
  }
}

export function useObserver() {
  // No reason to set up a ObserverContext on the server
  if (isServer) {
    return {
      [Symbol.dispose]() {},
    };
  }

  const contextObserverRef = useRef<ObserverContext>();

  if (!contextObserverRef.current) {
    contextObserverRef.current = new ObserverContext("component");
  }

  ObserverContext.stack.push(contextObserverRef.current);

  const context = contextObserverRef.current;

  useSyncExternalStore(
    // We subscribe to the context. This only notifies about a change
    (update) => context.subscribe(update),
    // We then grab the current snapshot, which is the global number for any change to any signal,
    // ensuring we'll always get a new snapshot whenever a related signal changes
    () => context.snapshot,
    // Even though Impact is not designed to run on the server, we still give this callback
    // as for example Next JS requires it to be there, even when rendering client only components
    () => context.snapshot,
  );

  return context;
}
