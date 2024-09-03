---
outline: deep
---

# cleanup

Use `cleanup` to dispose of any subscriptions, class instances etc. when the related provider unmounts from the component tree.

```ts
import { cleanup } from "@impact-react/[*]";

function MyStore() {
  let count = 0;

  const interval = setInterval(() => {
    console.log(count++);
  }, 500);

  cleanup(() => clearInterval(interval));

  return {};
}
```
