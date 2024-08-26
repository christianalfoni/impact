---
codeCaption: Creating a store
code: |
  import { signal, createStore, useObserver } from 'impact-react'

  function CounterStore() {
    const [count, setCount] = signal(0)

    return {
      count,
      increase() {
        setCount(current => current + 1)
      }
    }
  }

  const useCounterStore = createStore(CounterStore)

  function Counter() {
    using _ = useObserver()
    
    const { count, increase } = useCounterStore()

    return (
      <button onClick={increase}>
        Increase ({count()})
      </button>
    )
  }

  export default function App() {    
    return (
      <useCounterStore.Provider>
        <Counter />
      </useCounterStore.Provider>
    )
  }
---

# Store

When the React context does not work for us we have a tendency to replace it with global state management. Doing so definitely solves a friction, but we also leave something behind. With Impact we rather make the React contexts observable, gaining the benefits we find in global state management, without leaving behind the benefits of the React context.

So let us implement the [previous](./context.md) React context example with **Impact**.

```ts
import { signal, createStore } from "impact-react";

function CounterStore() {
  const [count, setCount] = signal(0);

  return {
    count,
    increase() {
      setCount((current) => current + 1);
    },
  };
}

const useCounterStore = createStore(CounterStore);
```

We have bailed out of the reconciliation loop and rather use observable primitives. We use `signal` instead of `useState` to define our state. To create the hook and provider to consume the store, we use the `createStore` function, instead of `createContext`.

Components will need the ability to observe what signals are being accessed from a store, and be notified when they change. Impact provides [observers](../observers.md) where a recent JavaScript feature has enabled a less intrusive way to make components observe. If you prefer a more traditional way, you are free to do so.

```tsx
import { signal, createStore, useObserver } from "impact-react";

// function CounterStore() {...}

// const useCounterStore = createStore(CounterStore)

function Counter() {
  using _ = useObserver();

  const { count, increase } = useCounterStore();

  return <button onClick={increase}>Increase ({count()})</button>;
}

export default function App() {
  return (
    <useCounterStore.Provider>
      <Counter />
    </useCounterStore.Provider>
  );
}
```

What you will notice with **Impact** is that consuming observable values requires you to call them, like the `count()`, to get the value. This is for technical reasons primarily, but it also highlights that indeed you are consuming an observable value.

::: tip

**Impact** allows you to combine its stores with other observable primitives, like [impact-react-mobx](https://github.com/christianalfoni/impact/tree/main/impact-react-mobx). The observable primitives from **Impact** is built to fit with React and its features, but you are free to use any of the other solutions.

:::

<ClientOnly>
  <Playground />
</ClientOnly>
