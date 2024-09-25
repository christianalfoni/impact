import { ObserverContext, SignalNotifier } from "./ObserverContext";

export type Derived<T> = () => T;

export function derived<T>(cb: () => T) {
  let value: T;

  // We keep track of it being dirty, because we only compute the result
  // of a derived when accessing it and it being dirty. It is lazy
  let isDirty = true;
  let disposer: (() => void) | undefined;
  const signalNotifier = new SignalNotifier();
  const context = new ObserverContext("derived");

  // TODO: How can we take advantage of WeakSet to dispose of the derived subscription?
  // onWillUnmount(() => disposer?.());

  return () => {
    if (ObserverContext.current) {
      ObserverContext.current.registerGetter(signalNotifier);
    }

    if (isDirty) {
      ObserverContext.stack.push(context);

      value = cb();

      ObserverContext.stack.pop();

      // We immediately subscribe to the ObserverContext, which
      // adds this context to the tracked signals
      disposer = context.subscribe(() => {
        // When notified about an update we immediately unsubscribe, as
        // we do not care about any further updates. When the derived is accessed
        // again it is dirty and a new subscription is set up
        disposer?.();
        // We only change the dirty state and notify
        isDirty = true;
        signalNotifier.notify();
      });

      // With a new value calculated it is not dirty anymore
      isDirty = false;
    }

    return value;
  };
}
