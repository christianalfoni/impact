import { signal } from "./signal";

export type QueryState =
  | {
      status: "IDLE";
    }
  | {
      status: "FETCHING";
    }
  | {
      status: "REFETCHING";
    };

export function query<T>(fetchData: () => Promise<T>) {
  let abortController: AbortController | undefined;

  const [promise, setPromise] = signal<Promise<T>>(fetchData());
  const [state, setState] = signal<QueryState>({
    status: "FETCHING",
  });

  function invalidate() {
    abortController?.abort();
    const currentAbortController = (abortController = new AbortController());

    setState({ status: "REFETCHING" });
    fetchData()
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

  return [{ promise, state }, invalidate] as const;
}
