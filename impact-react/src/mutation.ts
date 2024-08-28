import { createObservablePromise, ObservablePromise, signal } from "./signal";

export function mutation<T, U>(mutator: (data: U) => Promise<T>) {
  let abortController: AbortController | undefined;

  const [mutation, setMutation] = signal<
    | {
        promise: ObservablePromise<void>;
        data: U;
      }
    | undefined
  >(undefined);

  function mutate(data: U) {
    abortController?.abort();
    const currentAbortController = (abortController = new AbortController());

    return setMutation({
      promise: createObservablePromise(
        mutator(data),
        currentAbortController,
        (settledObservablePromise) => {
          if (settledObservablePromise.status === "fulfilled") {
            setMutation(undefined);
          } else {
            setMutation({
              data,
              promise: settledObservablePromise,
            });
          }
        },
      ),
      data,
    }).promise;
  }

  return [mutation, mutate] as const;
}
