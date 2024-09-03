import {
  createFulfilledPromise,
  createObservablePromise,
  createRejectedPromise,
  ObservablePromise,
  signal,
} from "./signal";

export type Query<T> = [
  () => {
    promise: ObservablePromise<T>;
    state: QueryState;
  },
  () => void,
];

export type QueryState = "idle" | "fetching" | "refetching";

export function query<T>(fetchData: () => Promise<T>) {
  let abortController = new AbortController();

  const [data, setData] = signal<{
    promise: ObservablePromise<T>;
    state: QueryState;
  }>({
    promise: createObservablePromise(
      fetchData(),
      abortController,
      (settledObservablePromise) => {
        setData({
          state: "idle",
          promise: settledObservablePromise,
        });
      },
    ),
    state: "fetching",
  });

  function invalidate() {
    abortController?.abort();
    const currentAbortController = (abortController = new AbortController());

    setData((current) => ({
      ...current,
      state: "refetching",
    }));

    return fetchData()
      .then((data) => {
        if (currentAbortController.signal.aborted) {
          return;
        }
        setData((current) => ({
          ...current,
          promise: createFulfilledPromise(Promise.resolve(data), data),
        }));
      })
      .catch((error) => {
        if (currentAbortController.signal.aborted) {
          return;
        }
        setData((current) => ({
          ...current,
          promise: createRejectedPromise(Promise.reject(error), error),
        }));
      })
      .finally(() => {
        if (currentAbortController.signal.aborted) {
          return;
        }

        setData((current) => ({
          ...current,
          state: "idle",
        }));
      });
  }

  return [data, invalidate] as const;
}
