import { useEffect, useState } from "react";

type CacheKey = string | (string | number | boolean)[];

type QueryFunction<K extends CacheKey, P extends any[], T> = (
  key: K,
  ...args: P
) => Promise<T>;

type IdleQueryState = {
  status: "idle";
};

type PendingQueryState = {
  status: "pending";
};

type FulfilledQueryState<T> = {
  status: "fulfilled";
  value: T;
};

type RejectedQueryState = {
  status: "rejected";
  reason: unknown;
};

type QueryState<T> =
  | IdleQueryState
  | PendingQueryState
  | FulfilledQueryState<T>
  | RejectedQueryState;

type CacheState<T> =
  | {
      status: "pending";
      abortController: AbortController;
      promise: Promise<T>;
    }
  | {
      status: "fulfilled";
      value: T;
      refetchAbortController?: AbortController;
    }
  | {
      status: "rejected";
      reason: unknown;
    };

class Query<K extends CacheKey, P extends any[], T> {
  constructor(private _queryFunction: QueryFunction<K, P, T>) {}
  private _getLookupKey(key: CacheKey): string {
    return String(key);
  }
  private _subscribers: Record<string, Set<(state: QueryState<T>) => void>> =
    {};
  private _cache: Record<string, CacheState<T>> = {};
  private _queryState: Record<string, QueryState<T>> = {};
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

        const state: QueryState<T> = {
          status: "fulfilled",
          value,
        };

        this._cache[lookupKey] = {
          status: "fulfilled",
          value,
        };

        this._notifySubscribers(lookupKey, state);

        return value;
      })
      .catch((reason) => {
        if (abortController.signal.aborted) {
          throw abortController.signal.reason;
        }

        const state: QueryState<T> = {
          status: "rejected",
          reason,
        };

        this._cache[lookupKey] = {
          status: "rejected",
          reason,
        };

        this._notifySubscribers(lookupKey, state);

        throw reason;
      });

    return {
      promise,
      abortController,
    };
  }
  clear(key?: K) {
    if (key) {
      const lookupKey = this._getLookupKey(key);
      const cache = this._cache[lookupKey];

      if (cache.status === "fulfilled" && cache.refetchAbortController) {
        cache.refetchAbortController.abort();
      }

      if (cache.status === "pending") {
        cache.abortController.abort();
      }

      delete this._cache[lookupKey];
      delete this._subscribers[lookupKey];
      delete this._queryState[lookupKey];
    } else {
      this._cache = {};
      this._subscribers = {};
      this._queryState = {};
    }
  }
  onFulfilled(key: K, subscriber: (value: T) => void) {
    return this._subscribe(key, (state) => {
      if (state.status === "fulfilled") {
        subscriber(state.value);
      }
    });
  }
  onRejected(key: K, subscriber: (reason: unknown) => void) {
    return this._subscribe(key, (state) => {
      if (state.status === "rejected") {
        subscriber(state.reason);
      }
    });
  }
  onStateChange(key: K, subscriber: (state: QueryState<T>) => void) {
    return this._subscribe(key, subscriber);
  }
  fulfill(key: K, value: T) {
    const lookupKey = this._getLookupKey(key);
    const cache = this._cache[lookupKey];

    if (!cache) {
      this._cache[lookupKey] = {
        status: "fulfilled",
        value,
      };
      this._queryState[lookupKey] = {
        status: "fulfilled",
        value,
      };
      this._notifySubscribers(lookupKey, this._queryState[lookupKey]);

      return;
    }

    if (cache.status === "pending") {
      cache.abortController.abort();
    }

    this._cache[lookupKey] = {
      status: "fulfilled",
      value,
    };
    this._queryState[lookupKey] = {
      status: "fulfilled",
      value,
    };

    this._notifySubscribers(lookupKey, this._queryState[lookupKey]);
  }
  reject(key: K, reason: unknown) {
    const lookupKey = this._getLookupKey(key);
    const cache = this._cache[lookupKey];

    if (!cache) {
      this._cache[lookupKey] = {
        status: "rejected",
        reason,
      };
      this._queryState[lookupKey] = {
        status: "rejected",
        reason,
      };
      this._notifySubscribers(lookupKey, this._queryState[lookupKey]);
      return;
    }

    if (cache.status === "pending") {
      cache.abortController.abort();
    }

    this._cache[lookupKey] = {
      status: "rejected",
      reason,
    };
    this._queryState[lookupKey] = {
      status: "rejected",
      reason,
    };
    this._notifySubscribers(lookupKey, this._queryState[lookupKey]);
  }
  subscribe(key: K): QueryState<T> {
    const lookupKey = this._getLookupKey(key);
    let queryState = this._queryState[lookupKey];

    if (!queryState) {
      queryState = this._queryState[lookupKey] = {
        status: "idle",
      };
    }

    const [state, setState] = useState(queryState);

    useEffect(() => this._subscribe(key, setState), [lookupKey]);

    return state;
  }
  suspend(key: K, ...params: P): T {
    const lookupKey = this._getLookupKey(key);

    const cache = this._cache[lookupKey];

    if (!cache) {
      throw this.fetch(key, ...params);
    }

    if (cache.status === "pending") {
      throw cache.promise;
    }

    if (cache.status === "rejected") {
      throw cache.reason;
    }

    this.subscribe(key);

    return cache.value;
  }
  fetchAndSubscribe(key: K, ...params: P) {
    this.fetch(key, ...params);

    return this.subscribe(key) as
      | PendingQueryState
      | FulfilledQueryState<T>
      | RejectedQueryState;
  }
  fetch(key: K, ...params: P): Promise<T> {
    const lookupKey = this._getLookupKey(key);
    const existingCache = this._cache[lookupKey];

    if (existingCache?.status === "pending") {
      return existingCache.promise;
    }

    if (
      existingCache?.status === "fulfilled" &&
      existingCache.refetchAbortController
    ) {
      existingCache.refetchAbortController.abort();
    }

    if (existingCache?.status === "fulfilled") {
      if (existingCache.refetchAbortController) {
        existingCache.refetchAbortController.abort();
      }

      const { abortController, promise } = this._runQueryFunction(
        key,
        ...params,
      );

      this._cache[lookupKey] = {
        status: "fulfilled",
        value: existingCache.value,
        refetchAbortController: abortController,
      };

      return promise;
    }

    const { promise, abortController } = this._runQueryFunction(key, ...params);

    this._cache[lookupKey] = {
      status: "pending",
      abortController,
      promise,
    };

    this._queryState[lookupKey] = {
      status: "pending",
    };

    return promise;
  }
}

export function query<K extends CacheKey, P extends any[], T>(
  queryFunction: QueryFunction<K, P, T>,
): Query<K, P, T> {
  return new Query(queryFunction);
}
