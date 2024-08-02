---
outline: deep
---

# cleanup

When stores are scoped to component trees you can use `cleanup` to dispose of any subscriptions, class instances etc. when the related provider unmounts from the component tree.

```ts
import { useStore, signal, createStoreProvider } from "impact-react";

export const useMyStore = () => useStore(MyStore);
export const MyStoreProvider = createStoreProvider(MyStore);

function MyStore() {
  const count = signal(0);

  const interval = setInterval(() => {
    count((current) => current + 1);
  }, 500);

  cleanup(() => clearInterval(interval));

  return {
    get count() {
      return count();
    },
  };
}
```
