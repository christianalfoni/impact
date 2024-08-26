---
outline: deep
---

# derived

Derived reactive state. Will observe any signals or other derived in its callback. It lazily evaluates, which means that when observation triggers, it only flags itself as dirty. The derived needs to be accessed to recalculate its value. Derived can only be defined with the creation of a store.

```ts
import { signal, derived } from "impact-react";

function CounterStore() {
  const [count, setCount] = signal(0);
  const doubleCount = derived(() => count() * 2);

  return {
    count,
    doubleCount,
  };
}
```
