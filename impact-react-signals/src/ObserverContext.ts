export type ObserverContextType = "component" | "derived" | "effect";

// Use for memory leak debugging
// const registry = new FinalizationRegistry((message) => console.log(message));

// This global counter makes sure that every signal update is unqiue and
// can be tracked by React
let currentSnapshot = 0;

// This is instantiated by a signal to keep track of what ObsererContexts are interested
// in the signal and notifies them when the signal changes
export class SignalNotifier {
  contexts = new Set<ObserverContext>();
  constructor() {}
  // A signal holds a global snapshot value, which changes whenever the signal changes.
  // This snapshot is passed and stored on the ObserverContext to make sure
  // React understands that a change has happened
  snapshot = ++currentSnapshot;
  addContext(context: ObserverContext) {
    this.contexts.add(context);
  }
  removeContext(context: ObserverContext) {
    this.contexts.delete(context);
  }
  notify() {
    // Any signal change updates the global snapshot
    this.snapshot = ++currentSnapshot;

    // A context can be synchronously added back to this signal related to firing the signal, which
    // could cause a loop. We only want to notify the current contexts
    const contexts = Array.from(this.contexts);

    contexts.forEach((context) => context.notify(this.snapshot));
  }
}

// The observer context is responsible for keeping track of signals accessed in a component, derived or effect. It
// does this by being set as the currently active ObserverContext in the stack. Any signals setting/getting will register
// to this active ObserverContext. The component/derived/effect then subscribes to the context, which will add the
// context to every signal tracked. When context is notified about a change it will remove itself from current signals
// and notify any subscribers of the context. It is expected that the subscriber(s) of the context will initiate tracking again.
// The subscription to the context can be disposed, which will also remove the context from any tracked signals. This makes
// sure that component/store unmount/disposal will also remove the context from any signals... making it primed for garbage collection
export class ObserverContext {
  // We keep a global reference to the currently active observer context. A component might first create one,
  // then resolving a store with a derived, which adds another, which might consume a derived from an other store,
  // which adds another etc.
  static stack: ObserverContext[] = [];
  static get current(): ObserverContext | undefined {
    return ObserverContext.stack[ObserverContext.stack.length - 1];
  }
  // We need to keep track of what signals are being set/get. The reason is that in an effect you can
  // not both get and set a signal, as observation would trigger the effect again. So in an effect we
  // prevent notifying updates when a signal has both a getter and a setter. This is also used for debugging
  _getters = new Set<SignalNotifier>();
  _setters = new Set<SignalNotifier>();
  // An ObserverContext only has one subscriber at any time
  _subscriber?: () => void;
  stackTrace = "";
  // Components are using "useSyncExternalStore" which expects a snapshot to indicate a change
  // to the store. We use a simple number for this to trigger reconciliation of a component. We start
  // out with the current as it reflects the current state of all signals
  snapshot = currentSnapshot;

  constructor(public type: ObserverContextType) {
    // Use for memory leak debugging
    // registry.register(this, this.id + " has been collected");
  }
  registerGetter(signal: SignalNotifier) {
    // We do not allow having getters when setting a signal, the reason is to ensure
    // no infinite loops
    if (this._setters.has(signal)) {
      return;
    }

    // When a signal is accessed during an ObservationContext scope we add it as a getter
    this._getters.add(signal);
  }
  registerSetter(signal: SignalNotifier) {
    // We do not allow having getters when setting a signal, the reason is to ensure
    // no infinite loops
    if (this._getters.has(signal)) {
      this._getters.delete(signal);
    }

    this._setters.add(signal);
  }
  // When adding a subscriber we ensure that the relevant signals are
  // notifying this ObserverContext of updates. That means when nothing
  // is subscribing to this ObserverContext the instance is free to
  // be garbage collected. React asynchronously subscribes and unsubscribes,
  // but useSyncExternalStore has a mechanism that ensures the validity
  // of the subscription using snapshots
  subscribe(subscriber: () => void) {
    this._subscriber = subscriber;
    this._getters.forEach((signal) => signal.addContext(this));

    return () => {
      this._subscriber = undefined;
      this._getters.forEach((signal) => signal.removeContext(this));
    };
  }

  // When a signal updates it goes through its registered contexts and calls this method.
  // Here we always know that we get the very latest global snapshot as it was just
  // generated. We immediately apply it and React will now reconcile given it is
  // subscribing
  notify(snapshot: number) {
    this.snapshot = snapshot;

    // We clear the tracking information of the ObserverContext when we notify
    // as it should result in a new tracking
    this._getters.forEach((signal) => {
      signal.removeContext(this);
    });
    this._getters.clear();
    this._setters.clear();
    this._subscriber?.();
  }
  // The ObserverContext can be used with explicit resource management
  [Symbol.dispose]() {
    ObserverContext.stack.pop();
  }
}
