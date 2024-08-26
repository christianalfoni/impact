import { signal } from "./signal";

export type MutationState<U> =
  | {
      status: "IDLE";
    }
  | {
      status: "MUTATING";
      data: U;
    };

export function mutation<T, U>(mutator: (data: U) => Promise<T>) {
  let abortController: AbortController | undefined;

  const [promise, setPromise] = signal<Promise<T> | undefined>(undefined);
  const [state, setState] = signal<MutationState<U>>({
    status: "IDLE",
  });

  function mutate(data: U) {
    abortController?.abort();
    const currentAbortController = (abortController = new AbortController());

    setState({
      status: "MUTATING",
      data,
    });
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

        setState({
          status: "IDLE",
        });
      });
  }

  return [{ promise, state }, mutate] as const;
}
