---
outline: deep
---

# createStoreProvider

Scope store to a component tree. This allows for passing props to the store and [cleanup](./cleanup.md) when the related component tree unmounts.

::: warning

1. If a nested component uses the `use` hook, make sure to put a `Suspense` also as a nested component of the StoreProvider. The created StoreProvider will throw an error if you forget. The reason for this is a lack of programmatic access to Reacts disposal behaviour of non committed component trees
2. Do not use React hooks within the stores. Technically when a store initialises it is still in Reacts render mode, but when the component with the `useStore` reconciles you will get a "hooks out of order" error from React. Currently there is no warning from Impact about this, but we are evaluating if there really is a need

:::

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
