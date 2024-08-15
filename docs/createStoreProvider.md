---
outline: deep
---

# createStoreProvider

Scope store to a component tree. This allows for passing props to the store and [cleanup](./cleanup.md) when the related component tree unmounts.

::: tip

If a nested component throws an error, the store provided will be disposed and the error is thrown further up the component tree. If you want to recover from nested errors without disposing the store, create error boundaries as a child of the StoreProvider.

:::

::: info
There are two scenarios where providing a store throws an error in development:

1. If you use the `use` hook with a promise in a nested component, but have no nested `Suspense` boundary to catch it
2. If the store is using React hooks

Both scenarios represents something you would normally not do, but might occur as you learn about Impact.

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
