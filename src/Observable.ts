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

let globalComputingContext: ObservableState<any>[] | undefined;

export class ObservableState<T> extends Observable<[value: T, prevValue: T]> {
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

export class ObservableComputedState<T> extends ObservableState<T> {
  constructor(computeFn: () => T) {
    let computingDisposers: Array<() => void> = [];
    const compute = () => {
      computingDisposers.forEach((dispose) => dispose());
      computingDisposers.length = 0;

      const computingContext: ObservableState<any>[] = [];
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

export class ObservableSubscription<T> extends ObservableState<T> {
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
      controller: AbortController;
      promise: Promise<T>;
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
  private state = new ObservableState<ObservablePromiseState<T>>({
    status: "IDLE",
  });
  get use() {
    return this.state.use;
  }

  set(sourcePromise: Promise<T>) {
    const controller = new AbortController();
    const promise = new Promise<T>((resolve, reject) => {
      controller.signal.addEventListener("abort", () => {
        reject(new ObservablePromiseAbortError());
        this.state.set({
          status: "REJECTED",
          error: "Aborted",
        });
      });

      const shouldBeResolved = () => {
        const state = this.state.get();
        return (
          !controller.signal.aborted &&
          state.status === "PENDING" &&
          state.promise === promise
        );
      };

      sourcePromise
        .then((value) => {
          if (!shouldBeResolved()) {
            return;
          }

          this.state.set({
            status: "RESOLVED",
            value,
          });

          resolve(value);
        })
        .catch((error) => {
          if (!shouldBeResolved()) {
            return;
          }

          this.state.set({
            status: "REJECTED",
            error,
          });
          reject(error);
        });
    });

    return this.state.set({
      status: "PENDING",
      controller,
      promise,
    });
  }
  abort() {
    const state = this.state.get();

    if (state.status === "PENDING") {
      state.controller.abort();
    }
  }
}

type ObservableBarrierState<T> =
  | {
      status: "ACTIVE";
      promise: Promise<T>;
      resolve: (value: T) => void;
      reject: (error: unknown) => void;
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

export class ObservableBarrier<T> extends ObservableState<
  ObservableBarrierState<T>
> {
  constructor() {
    super({
      status: "INACTIVE",
    });
  }

  enable() {
    if (this.get().status === "ACTIVE") {
      return;
    }

    let resolve: (value: T) => void;
    let reject: (error: unknown) => void;
    const promise = new Promise<T>((_resolve, _reject) => {
      resolve = _resolve;
      reject = _reject;
    });

    this.set({
      status: "ACTIVE",
      promise,
      resolve: resolve!,
      reject: reject!,
    });

    return promise;
  }
  resolve(result: T) {
    const state = this.get();

    if (state.status !== "ACTIVE") {
      return;
    }

    state.resolve(result);
    this.set({
      status: "RESOLVED",
      result,
    });
  }
  reject(error: unknown) {
    const state = this.get();

    if (state.status !== "ACTIVE") {
      return;
    }

    state.reject(error);

    this.set({
      status: "REJECTED",
      error,
    });
  }
}
