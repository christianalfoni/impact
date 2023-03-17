import { useEffect, useSyncExternalStore } from "react";

export class Observable<A extends any[]> {
  protected subscribers = new Set<(...args: A) => void>();
  private onSubscribers = new Set<(size: number) => void>();
  private isDisposed = false;

  protected notify(...args: A) {
    this.subscribers.forEach((subscriber) => {
      subscriber(...args);
    });
  }

  protected onSubscribe(onSubscriber: (size: number) => void) {
    if (this.isDisposed) {
      throw new Error("Observable is disposed");
    }

    this.onSubscribers.add(onSubscriber);

    return () => {
      this.onSubscribers.delete(onSubscriber);
    };
  }
  subscribe(subscriber: (...args: A) => void) {
    if (this.isDisposed) {
      throw new Error("Observable is disposed");
    }

    this.subscribers.add(subscriber);

    this.onSubscribers.forEach((onSubscriber) =>
      onSubscriber(this.subscribers.size)
    );

    return () => {
      this.subscribers.delete(subscriber);
      this.onSubscribers.forEach((onSubscriber) =>
        onSubscriber(this.subscribers.size)
      );
    };
  }
  dispose(): void {
    this.subscribers.clear();
    this.onSubscribers.clear();
    this.isDisposed = true;
  }
}

export class ObservableEmitter<T> extends Observable<[event: T]> {
  emit(event: T) {
    this.notify(event);
  }
  use(cb: (event: T) => void) {
    useEffect(() => this.subscribe(cb), []);
  }
}

export class ObservableState<T> extends Observable<[value: T, prevValue: T]> {
  constructor(private value: T) {
    super();
  }
  get() {
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
  use() {
    return useSyncExternalStore<T>(
      (listener) => this.subscribe(listener),
      () => this.get()
    );
  }
}

export class ObservableSubscription<T> extends Observable<[value: T]> {
  constructor(
    private value: T,
    subscription: (update: (value: T) => void) => () => void,
    activeOnlyWithSubscribers: boolean = false
  ) {
    super();
    let dispose: (() => void) | undefined;
    if (activeOnlyWithSubscribers) {
      this.onSubscribe((size) => {
        if (size === 1) {
          dispose = subscription((value) => {
            this.value = value;
            this.notify(value);
          });
        } else if (size === 0 && dispose) {
          dispose();
        }
      });
    } else {
      subscription((value) => {
        this.value = value;
        this.notify(value);
      });
    }
  }
  get() {
    return this.value;
  }
  use() {
    return useSyncExternalStore<T>(
      (listener) => this.subscribe(listener),
      () => this.get()
    );
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
  [state: Omit<ObservablePromiseState<T>, "controller" | "promise">]
> {
  private state: ObservablePromiseState<T> = {
    status: "IDLE",
  };
  get() {
    return this.state;
  }
  set(sourcePromise: Promise<T>) {
    const controller = new AbortController();
    const promise = new Promise<T>((resolve, reject) => {
      controller.signal.addEventListener("abort", () => {
        reject(new ObservablePromiseAbortError());
        this.state = {
          status: "REJECTED",
          error: "Aborted",
        };
        this.notify(this.state);
      });

      const shouldBeResolved = () => {
        return (
          !controller.signal.aborted &&
          this.state.status === "PENDING" &&
          this.state.promise === promise
        );
      };

      sourcePromise
        .then((value) => {
          if (!shouldBeResolved()) {
            return;
          }

          this.state = {
            status: "RESOLVED",
            value,
          };
          this.notify(this.state);
          resolve(value);
        })
        .catch((error) => {
          if (!shouldBeResolved()) {
            return;
          }

          this.state = {
            status: "REJECTED",
            error,
          };
          this.notify(this.state);
          reject(error);
        });
    });
    this.state = {
      status: "PENDING",
      controller,
      promise,
    };

    this.notify(this.state);

    return this.state.promise;
  }
  abort() {
    if (this.state.status === "PENDING") {
      this.state.controller.abort();
    }
  }
  use() {
    return useSyncExternalStore<ObservablePromiseState<T>>(
      (listener) => this.subscribe(listener),
      () => this.get()
    );
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
