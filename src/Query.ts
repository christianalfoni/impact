import { useEffect, useState } from "react";

type CacheKey = string | (string | number | boolean)[];

type QueryFunction<P extends any[], T> = (...args: P) => Promise<T>;

type QueriesFunction<K extends CacheKey, P extends any[], T> = (
  key: K,
  ...args: P
) => Promise<T>;

type PendingQueryState = {
  status: "pending";
};

type FulfilledQueryState<T> = {
  status: "fulfilled";
  value: T;
  isRefetching: boolean;
};

type RejectedQueryState = {
  status: "rejected";
  reason: unknown;
};

type State<T> =
  | {
      status: "pending";
      cache: PendingCacheState<T>;
      query: PendingQueryState;
    }
  | {
      status: "fulfilled";
      cache: FulfilledCacheState<T>;
      query: FulfilledQueryState<T>;
    }
  | {
      status: "rejected";
      cache: RejectedCacheState;
      query: RejectedQueryState;
    };

type QueryState<T> =
  | PendingQueryState
  | FulfilledQueryState<T>
  | RejectedQueryState;

type PendingCacheState<T> = {
  status: "pending";
  abortController: AbortController;
  promise: Promise<T>;
};

type FulfilledCacheState<T> = {
  status: "fulfilled";
  value: T;
  refetchAbortController?: AbortController;
};

type RejectedCacheState = {
  status: "rejected";
  reason: unknown;
};

class Queries<K extends CacheKey, P extends any[], T> {
  constructor(private _queryFunction: QueriesFunction<K, P, T>) {}
  private _getLookupKey(key: CacheKey): string {
    return String(key);
  }
  private _subscribers: Record<string, Set<(state: QueryState<T>) => void>> =
    {};
  private _state: Record<string, State<T>> = {};
  private _notifySubscribers(lookupKey: string, state: QueryState<T>) {
    this._subscribers[lookupKey]?.forEach((subscriber) => subscriber(state));
  }
  private _subscribe(key: K, subscriber: (state: QueryState<T>) => void) {
    const lookupKey = this._getLookupKey(key);
    let subscribers = this._subscribers[lookupKey];

    if (!subscribers) {
      subscribers = this._subscribers[lookupKey] = new Set();
    }

    subscribers.add(subscriber);

    return () => {
      subscribers.delete(subscriber);
    };
  }
  private _runQueryFunction(key: K, ...params: P) {
    const lookupKey = this._getLookupKey(key);
    const abortController = new AbortController();

    const promise = this._queryFunction(key, ...params)
      .then((value) => {
        if (abortController.signal.aborted) {
          return value;
        }

        this._setState(lookupKey, {
          status: "fulfilled",
          cache: {
            status: "fulfilled",
            value,
          },
          query: {
            status: "fulfilled",
            value,
            isRefetching: false,
          },
        });

        return value;
      })
      .catch((reason) => {
        if (abortController.signal.aborted) {
          throw abortController.signal.reason;
        }

        this._setState(lookupKey, {
          status: "rejected",
          cache: {
            status: "rejected",
            reason,
          },
          query: {
            status: "rejected",
            reason,
          },
        });

        throw reason;
      });

    return {
      promise,
      abortController,
    };
  }
  private _setState(lookupKey: string, state: State<T>) {
    this._state[lookupKey] = state;
    this._notifySubscribers(lookupKey, state.query);
  }
  private _fetch(key: K, ...params: P): Promise<T> {
    const lookupKey = this._getLookupKey(key);
    const state = this._state[lookupKey];

    if (state?.status === "pending") {
      return state.cache.promise;
    }

    if (state?.status === "fulfilled") {
      return Promise.resolve(state.cache.value);
    }

    if (state?.status === "rejected") {
      return Promise.reject(state.cache.reason);
    }

    const { promise, abortController } = this._runQueryFunction(key, ...params);

    this._setState(lookupKey, {
      status: "pending",
      cache: {
        status: "pending",
        abortController,
        promise,
      },
      query: {
        status: "pending",
      },
    });

    return promise;
  }
  onStatusChange(key: K, subscriber: (state: QueryState<T>) => void) {
    return this._subscribe(key, subscriber);
  }
  setValue(key: K, value: T) {
    const lookupKey = this._getLookupKey(key);
    const state = this._state[lookupKey];

    if (!state) {
      this._setState(lookupKey, {
        status: "fulfilled",
        cache: {
          status: "fulfilled",
          value,
        },
        query: {
          status: "fulfilled",
          value,
          isRefetching: false,
        },
      });

      return;
    }

    if (state.status === "pending") {
      state.cache.abortController.abort();
    }

    this._setState(lookupKey, {
      status: "fulfilled",
      cache: {
        status: "fulfilled",
        value,
      },
      query: {
        status: "fulfilled",
        value,
        isRefetching: false,
      },
    });
  }
  getValue(key: K, ...params: P): Promise<T> {
    return this._fetch(key, ...params);
  }
  fetch(key: K, ...params: P): QueryState<T> {
    const lookupKey = this._getLookupKey(key);

    this._fetch(key, ...params);

    const state = this._state[lookupKey];

    const [queryState, setQueryState] = useState(state.query);

    useEffect(() => this._subscribe(key, setQueryState), [lookupKey]);

    return queryState;
  }
  suspend(key: K, ...params: P): T {
    const lookupKey = this._getLookupKey(key);

    this.fetch(key, ...params);

    const state = this._state[lookupKey];

    if (state.status === "pending") {
      throw state.cache.promise;
    }

    if (state.status === "rejected") {
      throw state.cache.reason;
    }

    const [queryState, setQueryState] = useState(state.query);

    useEffect(
      () =>
        this._subscribe(key, (newQueryState) => {
          if (newQueryState.status === "fulfilled") {
            setQueryState(newQueryState);
          }
        }),
      [lookupKey],
    );

    return queryState.value;
  }

  refetch(key: K, ...params: P) {
    const lookupKey = this._getLookupKey(key);
    const state = this._state[lookupKey];

    if (state?.status === "fulfilled") {
      if (state.cache.refetchAbortController) {
        state.cache.refetchAbortController.abort();
      }

      const { abortController, promise } = this._runQueryFunction(
        key,
        ...params,
      );

      this._setState(lookupKey, {
        status: "fulfilled",
        cache: {
          status: "fulfilled",
          value: state.cache.value,
          refetchAbortController: abortController,
        },
        query: {
          status: "fulfilled",
          value: state.query.value,
          isRefetching: true,
        },
      });

      return promise;
    }

    return this.fetch(key, ...params);
  }
}

export function queries<K extends CacheKey, P extends any[], T>(
  queryFunction: QueriesFunction<K, P, T>,
): Queries<K, P, T> {
  return new Queries(queryFunction);
}

class Query<P extends any[], T> {
  constructor(private _queryFunction: QueryFunction<P, T>) {}
  private _subscribers: Set<(state: QueryState<T>) => void> = new Set();
  private _state?: State<T>;
  private _notifySubscribers(state: QueryState<T>) {
    this._subscribers.forEach((subscriber) => subscriber(state));
  }
  private _subscribe(subscriber: (state: QueryState<T>) => void) {
    this._subscribers.add(subscriber);

    return () => {
      this._subscribers.delete(subscriber);
    };
  }
  private _runQueryFunction(...params: P) {
    const abortController = new AbortController();

    const promise = this._queryFunction(...params)
      .then((value) => {
        if (abortController.signal.aborted) {
          return value;
        }

        this._setState({
          status: "fulfilled",
          cache: {
            status: "fulfilled",
            value,
          },
          query: {
            status: "fulfilled",
            value,
            isRefetching: false,
          },
        });

        return value;
      })
      .catch((reason) => {
        if (abortController.signal.aborted) {
          throw abortController.signal.reason;
        }

        this._setState({
          status: "rejected",
          cache: {
            status: "rejected",
            reason,
          },
          query: {
            status: "rejected",
            reason,
          },
        });

        throw reason;
      });

    return {
      promise,
      abortController,
    };
  }
  private _setState(state: State<T>) {
    this._state = state;
    this._notifySubscribers(state.query);
  }
  private _fetch(...params: P): Promise<T> {
    const state = this._state;

    if (state?.status === "pending") {
      return state.cache.promise;
    }

    if (state?.status === "fulfilled") {
      return Promise.resolve(state.cache.value);
    }

    if (state?.status === "rejected") {
      return Promise.reject(state.cache.reason);
    }

    const { promise, abortController } = this._runQueryFunction(...params);

    this._setState({
      status: "pending",
      cache: {
        status: "pending",
        abortController,
        promise,
      },
      query: {
        status: "pending",
      },
    });

    return promise;
  }
  onStatusChange(subscriber: (state: QueryState<T>) => void) {
    return this._subscribe(subscriber);
  }
  setValue(value: T) {
    const state = this._state;

    if (!state) {
      this._setState({
        status: "fulfilled",
        cache: {
          status: "fulfilled",
          value,
        },
        query: {
          status: "fulfilled",
          value,
          isRefetching: false,
        },
      });

      return;
    }

    if (state.status === "pending") {
      state.cache.abortController.abort();
    }

    this._setState({
      status: "fulfilled",
      cache: {
        status: "fulfilled",
        value,
      },
      query: {
        status: "fulfilled",
        value,
        isRefetching: false,
      },
    });
  }
  getValue(...params: P): Promise<T> {
    return this._fetch(...params);
  }
  fetch(...params: P): QueryState<T> {
    this._fetch(...params);

    // It is always there because we call "fetch"
    const state = this._state!;

    const [queryState, setQueryState] = useState(state.query);

    useEffect(() => this._subscribe(setQueryState), []);

    return queryState!;
  }
  suspend(...params: P): T {
    this.fetch(...params);

    // It is there becaues we call fetch
    const state = this._state!;

    if (state.status === "pending") {
      throw state.cache.promise;
    }

    if (state.status === "rejected") {
      throw state.cache.reason;
    }

    const [queryState, setQueryState] = useState(state.query);

    useEffect(
      () =>
        this._subscribe((newQueryState) => {
          if (newQueryState.status === "fulfilled") {
            setQueryState(newQueryState);
          }
        }),
      [],
    );

    return queryState.value;
  }

  refetch(...params: P) {
    const state = this._state;

    if (state?.status === "fulfilled") {
      if (state.cache.refetchAbortController) {
        state.cache.refetchAbortController.abort();
      }

      const { abortController, promise } = this._runQueryFunction(...params);

      this._setState({
        status: "fulfilled",
        cache: {
          status: "fulfilled",
          value: state.cache.value,
          refetchAbortController: abortController,
        },
        query: {
          status: "fulfilled",
          value: state.query.value,
          isRefetching: true,
        },
      });

      return promise;
    }

    return this.fetch(...params);
  }
}

export function query<P extends any[], T>(
  queryFunction: QueryFunction<P, T>,
): Query<P, T> {
  return new Query(queryFunction);
}
