---
outline: deep
---

# createStoreProvider

Scope store to a component tree. This allows for passing props to the store and [cleanup](./cleanup.md) when the related component tree unmounts.

```tsx
import { useStore, signal, createStoreProvider } from "impact-react";

function CounterStore({ initialCount }) {
  const count = signal(initialCount);

  return {
    get count() {
      return count();
    },
    increase() {
      count((current) => current + 1);
    },
  };
}

const CounterStoreProvider = createStoreProvider(CounterStore);

function Counter() {
  using counterStore = useStore(CounterStore);

  return (
    <button onClick={counterStore.increase}>
      Increase ({counterStore.count})
    </button>
  );
}

function App() {
  return (
    <CounterStoreProvider initialCount={10}>
      <Counter />
    </CounterStoreProvider>
  );
}
```
