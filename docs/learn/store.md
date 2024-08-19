---
codeCaption: Creating a store
code: |
  import { useStore, signal } from 'impact-react'

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

  export default function App() {
    using counterStore = useStore(CounterStore)

    return (
      <button onClick={counterStore.increase}>
        Increase ({counterStore.count})
      </button>
    )
  }
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

Traditional React state management depends on the reconciliation loop, but **Impact** frees you from that by defining a **Store**. The store is just a function where you are free to instantiate classes, assign local variables, start subscriptions, pretty much whatever you want. The function will **not** reconcile, it only runs once. With the observable primitives from Impact, like `signal`, your components will optimally consume state from these stores.

```tsx
import { useStore, signal } from "impact-react";

// function CounterStore() { ... }

export default function App() {
  using counterStore = useStore(CounterStore);

  return (
    <button onClick={counterStore.increase}>
      Increase ({counterStore.count})
    </button>
  );
}
```

The `useStore` function consumes a store. It can be used inside components and other stores. In components `useStore` is used in combination with the `using` keyword. The reason Impact uses the new [Explicit Resource Management](https://medium.com/@bagherani/ecmascript-explicit-resource-management-early-implementation-in-typescript-5-2-5e4d08b2aee3) JavaScript API is because it is the least intrusive API for components. With the `using` keyword there is no need to import an observer function or define your components in a specific way.

<ClientOnly>
  <Playground />
</ClientOnly>
