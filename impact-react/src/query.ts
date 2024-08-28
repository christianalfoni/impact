import {
  createFulfilledPromise,
  createObservablePromise,
  createRejectedPromise,
  ObservablePromise,
  signal,
} from "./signal";

export type QueryState = "IDLE" | "FETCHING" | "REFETCHING";

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
          state: "IDLE",
          promise: settledObservablePromise,
        });
      },
    ),
    state: "FETCHING",
  });

  function invalidate() {
    abortController?.abort();
    const currentAbortController = (abortController = new AbortController());

    setData((current) => ({
      ...current,
      state: "REFETCHING",
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
          state: "IDLE",
        }));
      });
  }

  return [data, invalidate] as const;
}
