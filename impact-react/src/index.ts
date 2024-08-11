import {
  Component,
  createContext,
  createElement,
  ReactNode,
  Suspense,
  useContext,
  useEffect,
  useRef,
  useSyncExternalStore,
} from "react";

// Use for memory leak debugging
// const registry = new FinalizationRegistry((message) => console.log(message));

// Polyfill this symbol as Safari currently does not have it
// @ts-ignore
Symbol.dispose ??= Symbol("Symbol.dispose");

export type ObserverContextType = "component" | "derived" | "effect";

// This object is used by the "impact-react-debugger" to access internals
export const signalDebugHooks: {
  onGetValue?: (context: ObserverContext, signal: SignalNotifier) => void;
  onSetValue?: (
    signal: SignalNotifier,
    value: unknown,
    derived?: boolean,
  ) => void;
  onEffectRun?: (effect: () => void) => void;
} = {};

const isProduction =
  typeof process !== "undefined" && process.env.NODE_ENV === "production";

const isUsingDebugger = () => typeof signalDebugHooks.onSetValue !== "function";

// This global counter makes sure that every signal update is unqiue and
// can be tracked by React
let currentSnapshot = 0;

// A store container is like an injection container. It is responsible for resolving stores. As stores can resolve
// other stores we keep track of the currently resolving stores. A `null` store is a global store
const resolvingStoreContainers: Array<StoreContainer | null> = [];

// By default Impact resolves to a global store. If a store provider is created for a store we keep track of it. That
// way we can throw an error if the provider has not been mounted when trying to consume the related store
const storeProviders = new Set<Store<any, any>>();

// If we resolve to a global store we keep the resolved stores here
const globalStores = new Map<Store<any, any>, any>();

// We only want a single observer context for a component, but you can use multiple "useStore". So we keep
// track of the currently active observer context to only create one for each component using one or multiple
// stores
let activeComponentObserverContext: ObserverContext | null = null;

// Identify if we have a resolving store. This allows the global "cleanup" function register cleanups to
// the currently resolving store. Also when resolving stores from components we do not want to track signal acessed
// in the store being resolved
export function getResolvingStoreContainer() {
  return resolvingStoreContainers[resolvingStoreContainers.length - 1];
}

// We need to know if we are resolving a store with an active ObserverContext
// for a component. If so we do not want to track signal access in the store
// itself
function isResolvingStoreFromComponent(context: ObserverContext) {
  return context.type === "component" && getResolvingStoreContainer();
}

// The type for store, which is just a function with optional props returning an object
export type Store<
  T extends Record<string, unknown>,
  A extends Record<string, unknown> | void,
> = (props: A) => T;

// We keep track of the resolved state of a store
export type StoreState =
  | {
      isResolved: true;
      value: any;
      storeRef: Store<any, any>;
    }
  | {
      isResolved: false;
      // The constructor is not the store itself, but a function created
      // by StoreProvider which includes the props
      constr: () => any;
      storeRef: Store<any, any>;
    };

// A store container is created by the StoreProvider in React. When using the "useStore" hook it first finds the
// context providing the store container and then resolves the store
class StoreContainer {
  // For obscure reasons (https://github.com/facebook/react/issues/17163#issuecomment-607510381) React will
  // swallow the first error on render and render again. To correctly throw the initial error we keep a reference to it
  private _resolvementError?: Error;
  private _state: StoreState;
  private _disposers = new Set<() => void>();

  // When constructing the provider for the store we only keep a reference to the store and
  // any parent store container
  constructor(
    storeRef: Store<any, any>,
    constr: () => any,
    // When the StoreProvider mounts it uses the React context to find the parent
    // store container
    private _parent: StoreContainer | null,
  ) {
    this._state = {
      isResolved: false,
      storeRef,
      constr,
    };
  }
  // When resolving the store we use a global "cleanup" function which acesses the currently resolving store
  // and registers the cleanup function
  registerCleanup(cleaner: () => void) {
    this._disposers.add(cleaner);
  }
  resolve<
    T extends Record<string, unknown>,
    A extends Record<string, unknown> | void,
  >(store: Store<T, A>): T {
    // If there is an error resolving the store we throw it
    if (this._resolvementError) {
      throw this._resolvementError;
    }

    // If we are trying to resolve the store this container is responsbile for and
    // it has already been resolved, we return it
    if (this._state.isResolved && store === this._state.storeRef) {
      return this._state.value;
    }

    // If we are trying to resolve the store this container is responsbile for and
    // it has NOT been resolved, we resolve it
    if (!this._state.isResolved && this._state.storeRef === store) {
      try {
        // We push to our global tracking of resolvement
        resolvingStoreContainers.push(this);
        // We resolve simply by calling the constructor
        this._state = {
          isResolved: true,
          value: this._state.constr(),
          storeRef: store,
        };
        // We pop off the resolvement tracker
        resolvingStoreContainers.pop();

        return this._state.value;
      } catch (e) {
        // See comment on why we need to do this
        this._resolvementError =
          new Error(`Could not initialize store "${store?.name}":
${String(e)}`);
        throw this._resolvementError;
      }
    }

    // If the store is not matching this store container and we have a parent, we start resolving the
    // store at the parent instead
    if (this._parent) {
      return this._parent.resolve(store);
    }

    // If we could not resolve the store through the context, but the store has a registered store provider,
    // we throw an error
    if (storeProviders.has(store)) {
      throw new Error(
        `The store ${store.name} should be provided on a context, but no provider was found`,
      );
    }

    // At this point we default to creating a global store, if not already created
    let resolvedStore = globalStores.get(store);

    if (!resolvedStore) {
      resolvingStoreContainers.push(null);
      // @ts-ignore
      resolvedStore = store();
      globalStores.set(store, resolvedStore);
      resolvingStoreContainers.pop();
    }

    return resolvedStore;
  }
  cleanup() {
    this._disposers.forEach((cleaner) => {
      cleaner();
    });
  }
}

// The context for the StoreContainer
const storeContainerContext = createContext<StoreContainer | null>(null);

// The StoreContainerProvider provides the store container which resolves the store. We use a class because
// we need the "componentWillUnmount" lifecycle hook
export class StoreContainerProvider<
  T extends Record<string, unknown> | void,
> extends Component<{
  store: Store<any, any>;
  props: T;
  children: React.ReactNode;
}> {
  static contextType = storeContainerContext;
  // We need to track the mounted state, as StrictMode will call componentDidMount
  // and componentWillUnmount twice, meaning we'll cleanup too early. This is a safeguard
  // against side effects in React, to allow this component to be part of suspended rendering.
  // Suspended rendering means it might render it, but never commit, meaning no call to componentDidMount
  // or componentWillUnmount. We have to resolve stores during reconciliation and can not
  // rely on componentDidMount. That means this component does not support suspended rendering.
  // This is documented and we throw an error if this happens
  private mounted = false;
  container = new StoreContainer(
    this.props.store,
    () => this.props.store(this.props.props),
    // eslint-disable-next-line
    // @ts-ignore
    this.context,
  );
  componentDidMount(): void {
    this.mounted = true;
  }
  componentWillUnmount(): void {
    this.mounted = false;
    Promise.resolve().then(() => {
      if (!this.mounted) {
        this.container.cleanup();
      }
    });
  }
  render(): ReactNode {
    return createElement(
      storeContainerContext.Provider,
      {
        value: this.container,
      },
      createElement(
        Suspense,
        {
          fallback: createElement(() => {
            throw new Error(
              "The StoreProvider does not support suspense. Please add a Suspense boundary between the StoreProvider and the component using suspense",
            );
          }),
        },
        this.props.children,
      ),
    );
  }
}

// We allow running this "cleanup" function globally. It uses the
// currently resolving container to register the cleanup function
export function cleanup(cleaner: () => void) {
  const resolvingStoreContainer = getResolvingStoreContainer();

  if (resolvingStoreContainer === undefined) {
    throw new Error('"cleanup" can only be used when creating a store');
  }

  // It is a global store
  if (resolvingStoreContainer === null) {
    return;
  }

  resolvingStoreContainer.registerCleanup(cleaner);
}

// "useStore" can be used in both components and other stores. When resolving from a component
// it will create an observer context and resolve the store. If resolving from a store it will
// only resolve the store
export function useStore<
  T extends Record<string, unknown>,
  A extends Record<string, unknown> | void,
>(store: Store<T, A>): T & { [Symbol.dispose](): void } {
  const resolvingStoreContainer = getResolvingStoreContainer();
  let resolvedStore: T;

  // If we are not currently resolving a store, we assume that we are resolving from a component as
  // you can really only initiate resolving stores from components
  if (!resolvingStoreContainer) {
    // We try to find a store container on the context first, to resolve a store from it
    const storeContainer = useContext(storeContainerContext);

    if (storeContainer) {
      resolvedStore = storeContainer.resolve<T, A>(store);
    } else if (storeProviders.has(store)) {
      // If we created a store provider for the store we throw an error, as it is expected that
      // the store provider should be mounted
      throw new Error(
        `The store ${store.name} should be provided on a context, but no provider was found`,
      );
    } else {
      // If we do not find a store container we resolve a global store
      resolvedStore = globalStores.get(store);

      if (!resolvedStore) {
        resolvingStoreContainers.push(null);
        // @ts-ignore
        resolvedStore = store();
        globalStores.set(store, resolvedStore);
        resolvingStoreContainers.pop();
      }
    }

    // We might already have used a store and created an observer context
    if (activeComponentObserverContext) {
      // This Symbol.dispose method is what explicit resource management (using keyword) call when exiting the
      // function component. Even though observation is already handled, we need to add the method
      // @ts-ignore
      resolvedStore[Symbol.dispose] = () => {
        // Since we add the disposer to the store itself, we remove it when we are done
        // @ts-ignore
        delete resolvedStore[Symbol.dispose];
      };

      // @ts-ignore
      return resolvedStore;
    }

    // So the consymption of this store is the first store and we need to create an observer context
    activeComponentObserverContext = useObserver();

    let hasUsedExplicitResourceManagement = false;

    // When debugging or not in production we'll throw an error if the disposer has not been called.
    // The reason is that you might forget using the "using" keyword, which breaks observation
    if (isUsingDebugger() || !isProduction) {
      const stackTrace = new Error().stack;

      Promise.resolve().then(() => {
        if (!hasUsedExplicitResourceManagement) {
          throw new Error(`You did not use the "using" keyword, observability will not work:

${stackTrace}`);
        }
      });
    }

    // Here we set up the cleanup of observation
    // @ts-ignore
    resolvedStore[Symbol.dispose] = () => {
      hasUsedExplicitResourceManagement = true;
      activeComponentObserverContext = null;
      // @ts-ignore
      delete resolvedStore[Symbol.dispose];

      // Observer contexts are global and we need to pop it off the stack as soon as the component
      // functions exists
      ObserverContext.stack.pop();
    };

    // @ts-ignore
    return resolvedStore;
  }

  // At this point we are not in a component and we resolve the store as normal
  resolvedStore = resolvingStoreContainer.resolve(store);

  if (isUsingDebugger() || !isProduction) {
    // We give a helpful indication about not using the "using" keyword in stores, as it is not necessary
    // @ts-ignore
    resolvedStore[Symbol.dispose] = () => {
      // @ts-ignore
      delete resolvedStore[Symbol.dispose];
      console.warn('There is no need to use "using" in stores');
    };
  }

  // @ts-ignore
  return resolvedStore;
}

// This function creates the actual StoreProvider component, which is responsible for providing
// handling the children and only pass relevant props and the store to the StoreContainerProvider
export function createStoreProvider<
  T extends Record<string, unknown>,
  A extends Record<string, unknown> | void,
>(store: Store<T, A>) {
  storeProviders.add(store);
  const StoreProvider = (
    props: A extends void
      ? { children: React.ReactNode }
      : {
          [K in keyof A]: A[K] extends Signal<infer V> ? V : never;
        } & { children: React.ReactNode },
  ) => {
    // To avoid TSLIB
    const extendedProps: any = Object.assign({}, props);
    const children = extendedProps.children;

    delete extendedProps.children;

    const propsSignals = useRef<any>();

    if (!propsSignals.current) {
      propsSignals.current = {};

      for (const key in extendedProps) {
        propsSignals.current[key] = signal(extendedProps[key]);
      }
    }

    useEffect(() => {
      for (const key in extendedProps) {
        propsSignals.current[key](extendedProps[key]);
      }
    }, [extendedProps]);

    return createElement(
      StoreContainerProvider,
      // @ts-ignore
      {
        props: propsSignals.current,
        store,
      },
      children,
    );
  };

  StoreProvider.displayName = store.name
    ? `${store.name}Provider`
    : "AnonymousStoreProvider";

  return StoreProvider;
}

// The observer context is responsible for keeping track of signals accessed in a component, derived or effect. It
// does this by being set as the currently active ObserverContext in the stack. Any signals setting/getting will register
// to this active ObserverContext. The component/derived/effect then subscribes to the context, which will add the
// context to every signal tracked. When context is notified about a change it will remove itself from current signals
// and notify any subscribers of the context. It is expected that the subsciber(s) of the context will initiate tracking again.
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
  private _getters = new Set<SignalNotifier>();
  private _setters = new Set<SignalNotifier>();
  private _subscribers = new Set<() => void>();
  public stackTrace = "";
  // Components are using "useSyncExternalStore" which expects a snapshot to indicate a change
  // to the store. We use a simple number for this to trigger reconciliation of a component. We start
  // out with the current as it reflects the current state of all signals
  snapshot = currentSnapshot;

  constructor(public type: "component" | "derived" | "effect") {
    if (signalDebugHooks.onGetValue) {
      this.stackTrace = new Error().stack || "";
    }
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
    this._subscribers.add(subscriber);

    if (this._subscribers.size === 1) {
      this._getters.forEach((signal) => signal.addContext(this));
    }

    return () => {
      this._subscribers.delete(subscriber);

      if (this._subscribers.size === 0) {
        this._getters.forEach((signal) => signal.removeContext(this));
      }
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

    // Subscriptions can synchronously be removed and added so we need
    // to make sure we only iterate the current subscribers, or the Set
    // will keep iterating forever
    const subscribers = Array.from(this._subscribers);

    subscribers.forEach((subscriber) => subscriber());
  }
}

// This is instantiated by a signal to keep track of what ObserContexts are interested
// in the signal and notifies them when the signal changes
export class SignalNotifier {
  private contexts = new Set<ObserverContext>();
  constructor() {}
  // A signal holds a global snapshot value, which changes whenever the signal changes.
  // This snapshot is passed and stored on the ObserverContext to make sure
  // React understands that a change has happened
  snapshot = currentSnapshot++;
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

export type Signal<T> = (
  value?:
    | T
    | ((current: T extends Promise<infer V> ? ObservablePromise<V> : T) => T),
) => T extends Promise<infer V> ? ObservablePromise<V> : T;

export function signal<T>(initialValue: T) {
  // If a signal has a promise we want to abort the current
  // resolving promise if we are changing it to a new one
  let currentAbortController: AbortController | undefined;

  let value =
    initialValue && initialValue instanceof Promise
      ? createObservablePromise(initialValue)
      : initialValue;

  const signalNotifier = new SignalNotifier();

  // This is responsible for creating the observable promise by
  // handling the resolved and rejected state of the initial promise and
  // notifying
  function createObservablePromise(
    promise: Promise<any>,
  ): ObservablePromise<T> {
    currentAbortController?.abort();

    const abortController = (currentAbortController = new AbortController());

    return createPendingPromise(
      promise
        .then(function (resolvedValue) {
          if (abortController.signal.aborted) {
            return;
          }

          value = createFulfilledPromise(
            Promise.resolve(resolvedValue),
            resolvedValue,
          );

          signalNotifier.notify();

          return resolvedValue;
        })
        .catch((rejectedReason) => {
          if (abortController.signal.aborted) {
            return;
          }

          const rejectedPromise = Promise.reject(rejectedReason);

          value = createRejectedPromise(rejectedPromise, rejectedReason);

          signalNotifier.notify();

          return rejectedPromise;
        }),
    );
  }

  return ((...args: any[]) => {
    if (!args.length) {
      // Consuming a store might resolve it synchronously. During that resolvement we
      // do not want to track access to any signals, only the signals actually consumed
      // in the component function body
      if (
        ObserverContext.current &&
        !isResolvingStoreFromComponent(ObserverContext.current)
      ) {
        ObserverContext.current.registerGetter(signalNotifier);
        if (signalDebugHooks.onGetValue) {
          signalDebugHooks.onGetValue(ObserverContext.current, signalNotifier);
        }
      }

      return value;
    }

    let newValue = args[0];

    // The update signature
    if (typeof newValue === "function") {
      newValue = newValue(value);
    }

    if (newValue instanceof Promise) {
      newValue = createObservablePromise(newValue);
    }

    // We do nothing if the values are the same
    if (value === newValue) {
      return value;
    }

    value = newValue;

    ObserverContext.current?.registerSetter(signalNotifier);

    if (signalDebugHooks.onSetValue) {
      signalDebugHooks.onSetValue(signalNotifier, value);
    }

    if (value instanceof Promise) {
      // A promise could be an already resolved promise, in which case we do not want to notify as it is
      // already done in "createObservablePromise". So we run our own micro task to check if the promise
      // is still pending, where we do want to notify
      Promise.resolve().then(() => {
        if (value instanceof Promise && value.status === "pending") {
          signalNotifier.notify();
        }
      });
    } else {
      signalNotifier.notify();
    }

    return value;
  }) as Signal<T>;
}

type PendingPromise<T> = Promise<T> & {
  status: "pending";
};

type FulfilledPromise<T> = Promise<T> & {
  status: "fulfilled";
  value: T;
};

type RejectedPromise<T> = Promise<T> & {
  status: "rejected";
  reason: unknown;
};

export type ObservablePromise<T> =
  | PendingPromise<T>
  | FulfilledPromise<T>
  | RejectedPromise<T>;

function createPendingPromise<T>(promise: Promise<T>): PendingPromise<T> {
  return Object.assign(promise, {
    status: "pending" as const,
  });
}

function createFulfilledPromise<T>(
  promise: Promise<T>,
  value: T,
): FulfilledPromise<T> {
  return Object.assign(promise, {
    status: "fulfilled" as const,
    value,
  });
}

function createRejectedPromise<T>(
  promise: Promise<T>,
  reason: unknown,
): RejectedPromise<T> {
  return Object.assign(promise, {
    status: "rejected" as const,
    reason,
  });
}

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

export type Derived<T> = () => T;

export function derived<T>(cb: () => T) {
  if (!getResolvingStoreContainer()) {
    throw new Error('You can only run "derived" when creating a store');
  }

  let value: T;

  // We keep track of it being dirty, because we only compute the result
  // of a derived when accessing it and it being dirty. It is lazy
  let isDirty = true;
  let disposer: (() => void) | undefined;
  const signalNotifier = new SignalNotifier();
  const context = new ObserverContext("derived");

  // We clean up the subscription on the derived when disposing the store
  cleanup(() => disposer?.());

  return () => {
    // Again, we do not want to track access to this derived if we are resolving a store
    // from a component and consuming the derived as part of resolving the store
    if (
      ObserverContext.current &&
      !isResolvingStoreFromComponent(ObserverContext.current)
    ) {
      ObserverContext.current.registerGetter(signalNotifier);
      if (signalDebugHooks.onGetValue) {
        signalDebugHooks.onGetValue(ObserverContext.current, signalNotifier);
      }
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

      if (signalDebugHooks.onSetValue) {
        signalDebugHooks.onSetValue(signalNotifier, value, true);
      }
    }

    return value;
  };
}

export function effect(cb: () => void) {
  if (!getResolvingStoreContainer()) {
    throw new Error('You can only run "effect" when creating a store');
  }

  let disposer: (() => void) | void;
  const context = new ObserverContext("effect");

  cleanup(() => disposer?.());

  runEffect();

  function runEffect() {
    disposer?.();

    ObserverContext.stack.push(context);

    cb();

    ObserverContext.stack.pop();

    disposer = context.subscribe(runEffect);

    if (signalDebugHooks.onEffectRun) {
      signalDebugHooks.onEffectRun(cb);
    }
  }
}

// The hook that syncs React with the ObserverContext.
function useObserver() {
  const contextObserverRef = useRef<ObserverContext>();

  if (!contextObserverRef.current) {
    contextObserverRef.current = new ObserverContext("component");
  }

  ObserverContext.stack.push(contextObserverRef.current);

  // We create a new context every time React reconciles. The reason is that the subscription to the context
  // does not dispose before a new reconciliation.
  const context = contextObserverRef.current;

  useSyncExternalStore(
    // We subscribe to the context. This only notifies about a change
    (update) => context.subscribe(update),
    // We then grab the current snapshot, which is the global number for any change to any signal,
    // ensuring we'll always get a new snapshot whenever a related signal changes
    () => context.snapshot,
    // Server side
    () => context.snapshot,
  );

  return context;
}
