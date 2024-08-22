---
codeCaption: Creating a store
code: |
  import { useStore, signal, observer } from 'impact-react'

  function CounterStore() {
    const count = signal(0)

    return {
      get count() {
        return count()
      },
      increase() {
        count(current => current + 1)
      }
    }
  }

  export default observer(function App() {
    const { count, increase } = useStore(CounterStore)

    return (
      <button onClick={increase}>
        Increase ({count})
      </button>
    )
  })
---

# Store

Moving back to our initial example we implement the same `count` and `increase` using **Impact**.

```ts
import { signal } from "impact-react";

function CounterStore() {
  const count = signal(0);

  return {
    get count() {
      return count();
    },
    increase() {
      count((current) => current + 1);
    },
  };
}
```

Traditional React state management depends on the reconciliation loop, but **Impact** frees you from that by defining a **Store**. The store is just a function where you are free to instantiate classes, assign local variables, start subscriptions, pretty much whatever you want. The function will **not** reconcile, it only runs once. With the observable primitives from Impact, like `signal`, your components will optimally consume state from these stores. We use a `getter` to return the count as we only want to change it from within the store and when a component accesses the count it will start observing it.

```tsx
import { signal, userStore, observer } from "impact-react";

// function CounterStore() { ... }

export default observer(function App() {
  const { count, increase } = useStore(CounterStore);

  return <button onClick={increase}>Increase ({count})</button>;
});
```

The `useStore` function consumes a store. It can be used inside components and other stores. In this example we use the `observer` higher order component to enable observation in the component, but your team can decide which [observers](../observers.md) you want to use in your application.

<ClientOnly>
  <Playground />
</ClientOnly>
