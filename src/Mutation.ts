import { useEffect, useState } from "react";

type IdentifierKey = string | (string | number | boolean)[];

type MutationsFunction<K extends IdentifierKey, P extends any[], T> = (
  key: K,
  ...args: P
) => Promise<T>;

type IdleState = {
  status: "idle";
};

type PendingState = {
  status: "pending";
};

type FulfilledState<T> = {
  status: "fulfilled";
  value: T;
};

type RejectedState = {
  status: "rejected";
  reason: unknown;
};

type State<T> = IdleState | PendingState | FulfilledState<T> | RejectedState;

class Mutations<K extends IdentifierKey, P extends any[], T> {
  constructor(private _queryFunction: MutationsFunction<K, P, T>) {}
  private _getLookupKey(key: IdentifierKey): string {
    return String(key);
  }
  private _subscribers: Record<string, Set<(state: State<T>) => void>> = {};
  private _state: Record<string, State<T>> = {};
  private _notifySubscribers(lookupKey: string, state: State<T>) {
    this._subscribers[lookupKey]?.forEach((subscriber) => subscriber(state));
  }
  private _subscribe(key: K, subscriber: (state: State<T>) => void) {
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
  private _runMutationFunction(key: K, ...params: P) {
    const lookupKey = this._getLookupKey(key);

    const promise = this._queryFunction(key, ...params)
      .then((value) => {
        this._setState(lookupKey, {
          status: "fulfilled",
          value,
        });

        return value;
      })
      .catch((reason) => {
        this._setState(lookupKey, {
          status: "rejected",
          reason,
        });

        throw reason;
      });

    return promise;
  }
  private _setState(lookupKey: string, state: State<T>) {
    this._state[lookupKey] = state;
    this._notifySubscribers(lookupKey, state);
  }
  onStatusChange(key: K, subscriber: (state: State<T>) => void) {
    return this._subscribe(key, subscriber);
  }
  subscribe(key: K): State<T> {
    const lookupKey = this._getLookupKey(key);

    let mutationState = this._state[lookupKey];

    if (!mutationState) {
      mutationState = this._state[lookupKey] = {
        status: "idle",
      };
    }

    const [state, setState] = useState(mutationState);

    useEffect(() => this._subscribe(key, setState), [lookupKey]);

    return state;
  }
  mutate(key: K, ...params: P): Promise<T> {
    const lookupKey = this._getLookupKey(key);

    const promise = this._runMutationFunction(key, ...params);

    this._setState(lookupKey, {
      status: "pending",
    });

    return promise;
  }
}

export function mutations<K extends IdentifierKey, P extends any[], T>(
  mutationsFunction: MutationsFunction<K, P, T>,
): Mutations<K, P, T> {
  return new Mutations(mutationsFunction);
}

type MutationFunction<P extends any[], T> = (...args: P) => Promise<T>;

class Mutation<P extends any[], T> {
  constructor(private _queryFunction: MutationFunction<P, T>) {}
  private _getLookupKey(key: IdentifierKey): string {
    return String(key);
  }
  private _subscribers: Set<(state: State<T>) => void> = new Set();
  private _state?: State<T>;
  private _notifySubscribers(state: State<T>) {
    this._subscribers.forEach((subscriber) => subscriber(state));
  }
  private _subscribe(subscriber: (state: State<T>) => void) {
    this._subscribers.add(subscriber);

    return () => {
      this._subscribers.delete(subscriber);
    };
  }
  private _runMutationFunction(...params: P) {
    const promise = this._queryFunction(...params)
      .then((value) => {
        this._setState({
          status: "fulfilled",
          value,
        });

        return value;
      })
      .catch((reason) => {
        this._setState({
          status: "rejected",
          reason,
        });

        throw reason;
      });

    return promise;
  }
  private _setState(state: State<T>) {
    this._state = state;
    this._notifySubscribers(state);
  }
  onStatusChange(subscriber: (state: State<T>) => void) {
    return this._subscribe(subscriber);
  }
  subscribe(): State<T> {
    let state = this._state;

    if (!state) {
      state = this._state = {
        status: "idle",
      };
    }

    const [mutationState, setMutationState] = useState(state);

    useEffect(() => this._subscribe(setMutationState), []);

    return mutationState;
  }
  mutate(...params: P): Promise<T> {
    const promise = this._runMutationFunction(...params);

    this._setState({
      status: "pending",
    });

    return promise;
  }
}

export function mutation<P extends any[], T>(
  mutationFunction: MutationFunction<P, T>,
): Mutation<P, T> {
  return new Mutation(mutationFunction);
}
