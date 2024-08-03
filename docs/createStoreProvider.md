---
outline: deep
---

# createStoreProvider

Scope store to a component tree. This allows for passing props to the store and [cleanup](./cleanup.md) when the related component tree unmounts.

::: warning

You can not suspend store providers. The reason is that during suspense the "rendered components" might not be committed to the DOM and rather be disposed. React does not indicate when this happens, resulting in a lack of calling cleanup. In practice just do not put the store provider between a suspense boundary and a component consuming a promise with the use hook.

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
