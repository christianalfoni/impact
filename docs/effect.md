---
outline: deep
---

# effect

Reactive effect. Will observe any signals or derived in its callback. It runs immediately and will run again whenever observation triggers. If an effect both observes and sets the same signal, the observation is ignored.

```ts
import { effect, signal } from "impact-react";

function createApp() {
  const count = signal(0);

  effect(() => {
    console.log(count());
  });

  return {
    get count() {
      return count();
    },
  };
}
```
