---
outline: deep
---

# useStore

The hook that allows you to consume your store in a component or from other stores.

```ts
import { useStore, signal } from "impact-react";

export const useMyStore = () => useStore(MyStore);

function MyStore() {
  const count = signal(0);

  return {
    get count() {
      return count();
    },
  };
}
```

When a store is provided to the component tree it can consume other parent stores directly.

```ts
import { useStore, signal, createStoreProvider } from "impact-react";
import { useGlobalStore } from "./GlobalStore";

export const useMyStore = () => useStore(MyStore);
export const MyStoreProvider = createStoreProvider(MyStore);

function MyStore() {
  const globalStore = useGlobalStore();

  const count = signal(globalStore.initialCount);

  return {
    get count() {
      return count();
    },
  };
}
```

::: tip

Under the hood `useStore` uses the `useObservable` hook.

:::
