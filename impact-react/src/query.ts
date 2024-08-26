import { signal } from "./signal";

export type QueryState = "IDLE" | "FETCHING" | "REFETCHING" | "STALE";

export function query<T>(fetchData: () => Promise<T>) {
  let currentPromise = fetchData();

  const [promise, setPromise] = signal<Promise<T>>(currentPromise);
  const [state, setState] = signal<QueryState>("FETCHING");

  function invalidate() {
    currentPromise = setPromise(fetchData()).then((data) =>
      setPromise(Promise.resolve(data)),
    );
    // What if it gets rejected? Should queryState have a status and reason on failed refetch?
    // Or produce a rejected promise?
    // We probably want to abort the currently runnning promise
  }

  return [{ promise, state }, () => invalidate] as const;
}
