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

When context in React does not work for us we have a tendency to replace it with global state management. With Impact we rather make the React contexts observable. So let us implement the [previous](./context.md) React context example in **Impact**.

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

We have now bailed out of the reconciliation loop and rather use observable primitives, like `signal`, to define our state. **Impact** was designed to be as natural of a stepping stone from React as possible. To create the hook and provider to consume the store, you use the `createStore` function.

Components will need the ability to observe what signals are being accessed in a store, and be notified when they change. Impact provides [observers](../observers.md) where a recent JavaScript feature has enabled a less intrusive way to make components observe. If you prefer a more traditional way, you are free to do so though.

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

::: info

You might immediately think of [Mobx](https://mobx.js.org/README.html) as a much better observable primitive. Mobx is great, but it follows different paradigms than React. Mobx encourages a mutable paradigm, while React has an immutable paradigm. Mobx encourages an object oriented paradigm, while React is functional. Mobx observables are not naturally protected in stores unless you combine it with the additional action concept. Mobx is a really great solution, but it does require you and your team to be comfortable working in two paradigms.

:::

<ClientOnly>
  <Playground />
</ClientOnly>
