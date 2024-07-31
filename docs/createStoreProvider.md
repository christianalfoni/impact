---
outline: deep
---

# createStoreProvider

Scope store to a component tree. This allows for passing props to the store and [cleanup](./cleanup.md) when the related component tree unmounts.

```tsx
import { useStore, signal, createStoreProvider, observer } from "impact-react";

function MyStore({ initialCount }) {
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

const useMyStore = () => useStore(MyStore);
const MyStoreProvider = createStoreProvider(MyStore);

const Counter = observer(() => {
  const { count, increase } = useMyStore();

  return <button onClick={increase}>Increase ({count})</button>;
});

const App = () => {
  return (
    <MyStoreProvider initialCount={10}>
      <Counter />
    </MyStoreProvider>
  );
};
```
