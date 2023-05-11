import { useEffect, useSyncExternalStore } from "react";

export class Observable<A extends any[]> {
  protected subscribers = new Set<(...args: A) => void>();

  protected isDisposed = false;

  protected notify(...args: A) {
    // When calling subscribers, they might be removed/added again during the forEach
    // of the Set, so we want to make sure we only notify the current subscribers
    const currentSubscribers = Array.from(this.subscribers);

    currentSubscribers.forEach((subscriber) => {
      subscriber(...args);
    });
  }

  subscribe = (subscriber: (...args: A) => void) => {
    if (this.isDisposed) {
      throw new Error("Observable is disposed");
    }

    this.subscribers.add(subscriber);

    return () => {
      this.subscribers.delete(subscriber);
    };
  };

  protected dispose(): void {
    this.subscribers.clear();
    this.isDisposed = true;
  }
}

export class ObservableEmitter<T> extends Observable<[event: T]> {
  emit(event: T) {
    this.notify(event);
  }
  use = (cb: (event: T) => void) => {
    useEffect(() => this.subscribe(cb), []);
  };
}

let globalComputingContext: ObservableValue<any>[] | undefined;

export class ObservableValue<T> extends Observable<[value: T, prevValue: T]> {
  constructor(private value: T) {
    super();
  }

  use = () => {
    return useSyncExternalStore<T>(
      (listener) => this.subscribe(listener),
      () => this.get()
    );
  };

  get() {
    if (globalComputingContext && !globalComputingContext.includes(this)) {
      globalComputingContext.push(this);
    }

    return this.value;
  }

  set(newValue: T) {
    const prevValue = this.value;
    this.value = newValue;

    this.notify(this.value, prevValue);

    return this.value;
  }
  update(cb: (currentValue: T) => T) {
    const prevValue = this.value;
    this.value = cb(prevValue);

    this.notify(this.value, prevValue);

    return this.value;
  }
}

export class ObservableComputedState<T> extends ObservableValue<T> {
  constructor(computeFn: () => T) {
    let computingDisposers: Array<() => void> = [];
    const compute = () => {
      computingDisposers.forEach((dispose) => dispose());
      computingDisposers.length = 0;

      const computingContext: ObservableValue<any>[] = [];
      globalComputingContext = computingContext;

      const value = computeFn();

      globalComputingContext = undefined;

      computingDisposers = computingContext.map((observableState) => {
        return observableState.subscribe(() => {
          this.set(compute());
        });
      });

      return value;
    };

    super(compute());
  }
}

export class ObservableSubscription<T> extends ObservableValue<T> {
  private disposeSubscription: () => void = () => {};
  constructor(
    value: T,
    private subscription: (update: (value: T) => void) => () => void,
    private activeOnlyWithSubscribers: boolean = false
  ) {
    super(value);

    if (!activeOnlyWithSubscribers) {
      this.disposeSubscription = subscription((value) => {
        this.set(value);
      });
    }

    const _subscribe = this.subscribe;

    this.subscribe = (subscriber: (value: T, prevValue: T) => void) => {
      const disposeSubscriber = _subscribe(subscriber);

      if (this.activeOnlyWithSubscribers && this.subscribers.size === 1) {
        this.disposeSubscription = this.subscription((value) => {
          this.set(value);
        });
      }

      return () => {
        disposeSubscriber();
        if (this.activeOnlyWithSubscribers && this.subscribers.size === 0) {
          this.disposeSubscription();
        }
      };
    };
  }

  dispose(): void {
    super.dispose();
    this.disposeSubscription();
  }
}

export type ObservablePromiseState<T> =
  | {
      status: "IDLE";
    }
  | {
      status: "PENDING";
    }
  | {
      status: "RESOLVED";
      value: T;
    }
  | {
      status: "REJECTED";
      error: unknown;
    };

export class ObservablePromiseAbortError extends Error {
  constructor() {
    super("ABORTED");
  }
}

export class ObservablePromise<T> extends Observable<
  [state: ObservablePromiseState<T>]
> {
  private state = new ObservableValue<ObservablePromiseState<T>>({
    status: "IDLE",
  });

  private currentController?: AbortController;

  get use() {
    return this.state.use;
  }

  set(sourcePromise: Promise<T>) {
    const controller = new AbortController();
    const pendingState = {
      status: "PENDING" as const,
    };

    controller.signal.addEventListener("abort", () => {
      this.state.set({
        status: "REJECTED",
        error: "Aborted",
      });
    });

    this.currentController = controller;

    const shouldBeResolved = () => {
      const state = this.state.get();
      return !controller.signal.aborted && state === pendingState;
    };

    sourcePromise
      .then((value) => {
        if (!shouldBeResolved()) {
          return;
        }

        this.currentController = undefined;

        this.state.set({
          status: "RESOLVED",
          value,
        });
      })
      .catch((error) => {
        if (!shouldBeResolved()) {
          return;
        }

        this.currentController = undefined;

        this.state.set({
          status: "REJECTED",
          error,
        });
      });

    return this.state.set(pendingState);
  }
  abort() {
    const state = this.state.get();

    if (state.status === "PENDING" && this.currentController) {
      this.currentController.abort();
    }
  }
}

type ObservableBarrierState<T> =
  | {
      status: "ACTIVE";
    }
  | {
      status: "INACTIVE";
    }
  | {
      status: "RESOLVED";
      result: T;
    }
  | {
      status: "REJECTED";
      error: unknown;
    };

export class ObservableBarrier<T> extends ObservableValue<
  ObservableBarrierState<T>
> {
  private currentPromiseResolvement?: {
    resolve: (value: T) => void;
    reject: (error: unknown) => void;
  };
  constructor() {
    super({
      status: "INACTIVE",
    });
  }

  enable() {
    if (this.get().status === "ACTIVE") {
      return;
    }

    const promise = new Promise<T>((resolve, reject) => {
      this.currentPromiseResolvement = {
        resolve,
        reject,
      };
    });

    this.set({
      status: "ACTIVE",
    });

    return promise;
  }
  resolve(result: T) {
    const state = this.get();

    if (state.status !== "ACTIVE" || !this.currentPromiseResolvement) {
      return;
    }

    this.currentPromiseResolvement.resolve(result);
    this.currentPromiseResolvement = undefined;

    this.set({
      status: "RESOLVED",
      result,
    });
  }
  reject(error: unknown) {
    const state = this.get();

    if (state.status !== "ACTIVE" || !this.currentPromiseResolvement) {
      return;
    }

    this.currentPromiseResolvement.reject(error);
    this.currentPromiseResolvement = undefined;

    this.set({
      status: "REJECTED",
      error,
    });
  }
}

export function value<T>(value: T) {
  return new ObservableValue<T>(value);
}

export function emitter<T>() {
  return new ObservableEmitter<T>();
}

export function promise<T>() {
  return new ObservablePromise<T>();
}

export function barrier<T>() {
  return new ObservableBarrier<T>();
}

export function subscription<T>(
  initialValue: T,
  subscription: (update: (value: T) => void) => () => void,
  activeOnlyWithSubscribers: boolean = false
) {
  return new ObservableSubscription<T>(
    initialValue,
    subscription,
    activeOnlyWithSubscribers
  );
}

export function computed<T>(computeFn: () => T) {
  return new ObservableComputedState<T>(computeFn);
}
