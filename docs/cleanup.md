---
outline: deep
---

# cleanup

When stores are scoped to component trees you can use `cleanup` to dispose of any subscriptions, class instances etc. when the related provider unmounts from the component tree.

```ts
import { signal, createStore } from "impact-react";

export const useMyStore = createStore(MyStore);

function MyStore() {
  const [count, setCount] = signal(0);

  const interval = setInterval(() => {
    setCount((current) => current + 1);
  }, 500);

  cleanup(() => clearInterval(interval));

  return {
    count,
  };
}
```
