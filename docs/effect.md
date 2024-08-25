---
outline: deep
---

# effect

Reactive effect. Will observe any signals or derived in its callback. It runs immediately and will run again whenever observation triggers. If an effect both observes and sets the same signal, the observation is ignored. Effects can only be defined with the creation of the store.

```ts
import { effect, signal } from "impact-react";

function CounterStore() {
  const [count, setCount] = signal(0);

  effect(() => {
    console.log(count());
  });

  return {
    count,
  };
}
```
