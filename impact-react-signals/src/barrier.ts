import { signal } from "./signal";

export function barrier<T>() {
  let resolver: any;
  let rejecter: any;
  const [promise, setPromise] = signal<Promise<T> | undefined>(undefined);

  function enable() {
    let currentPromise = promise();

    if (!currentPromise) {
      currentPromise = setPromise(
        new Promise<T>((resolve, reject) => {
          resolver = resolve;
          rejecter = reject;
        }),
      );
    }

    return currentPromise;
  }

  function resolve(value: T) {
    setPromise(undefined);
    resolver(value);
  }

  function reject(error: unknown) {
    setPromise(undefined);
    rejecter(error);
  }

  return [promise, { enable, resolve, reject }] as const;
}
