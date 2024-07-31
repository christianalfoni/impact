---
outline: deep
---

# observer

Components needs to observe any signals that are consumed. They do this with the `observer` function, which can be used in two different ways:

```tsx
import { observer, signal, useStore } from "impact-react";

function CounterStore() {
  const count = signal(0);

  return {
    get count() {
      return count();
    },
  };
}

const useCounterStore = () => useStore(CounterStore);

// This is what you know from other libraries. The drawback of this is that you
// have to define your components as variables and they become anonymously named
// in the React Devtools
const TraditionalUsage = observer(() => {
  const { count } = useCounterStore();

  return <h1>Count: {count}</h1>;
});

// Explicit resource control is a new feature of JavaScript that allows us to
// use the observer inline. This syntax allows for normal function
// definition of components
function ModernUsage() {
  using _ = observer();

  const { count } = useCounterStore();

  return <h1>Count: {count}</h1>;
}
```
