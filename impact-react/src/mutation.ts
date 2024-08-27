import { signal } from "./signal";

export function mutation<T, U>(mutator: (data: U) => Promise<T>) {
  let abortController: AbortController | undefined;

  const [promise, setPromise] = signal<Promise<T> | undefined>(undefined);
  const [optimisticData, setOptimisticData] = signal<U | undefined>(undefined);

  function mutate(data: U) {
    abortController?.abort();
    const currentAbortController = (abortController = new AbortController());

    setOptimisticData(data);
    mutator(data)
      .then((data) => {
        if (currentAbortController.signal.aborted) {
          return;
        }
        setPromise(Promise.resolve(data));
      })
      .catch((error) => {
        if (currentAbortController.signal.aborted) {
          return;
        }
        setPromise(Promise.reject(error));
      })
      .finally(() => {
        if (currentAbortController.signal.aborted) {
          return;
        }

        setOptimisticData(undefined);
      });
  }

  return [{ promise, optimisticData }, mutate] as const;
}
