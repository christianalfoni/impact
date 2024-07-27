---
outline: deep
---

# derived

Derived reactive state. Will observe any signals or other derived in its callback. It lazily evaluates, which means that when observation triggers, it only flags itself as dirty. The derived needs to be accessed to recalculate its value.

```ts
import { signal, derived } from "impact-react";

function createApp() {
  const count = signal(0);
  const doubleCount = derived(() => count * 2);

  return {
    get count() {
      return count();
    },
    get doubleCount() {
      return doubleCount();
    },
  };
}
```
