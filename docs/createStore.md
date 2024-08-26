---
outline: deep
---

# createStore

Creates the hook and related provider for the store. Just like React you can have multiple instances of the same store simply by providing it in different parts of your component tree.

::: tip

If a nested component throws an error, the store provided will be disposed and the error is thrown further up the component tree. If you want to recover from nested errors without disposing the store, create error boundaries related to nested components of the StoreProvider.

:::

```tsx
import { signal, createStore, useObserver } from "impact-react";

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

const useCounterStore = createStore(CounterStore);

function Counter() {
  using _ = useObserver();

  const { count, increase } = useCounterStore();

  return <button onClick={increase}>Increase ({count})</button>;
}

function App() {
  return (
    <useCounterStore.Provider initialCount={10}>
      <Counter />
    </useCounterStore.Provider>
  );
}
```

::: info
There are two scenarios where providing a store throws an error in development:

1. If you use the `use` hook with a promise in a nested component, but have no `Suspense` boundary between the StoreProvider and the nested component to catch it
2. If the store is using React hooks

Both scenarios represents something you would normally not do, but might occur as you learn about Impact.

:::
