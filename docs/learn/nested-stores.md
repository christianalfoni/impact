---
codeCaption: Nested stores
code: |
  import { signal, createStore, cleanup, useObserver } from 'impact-react'

  function GlobalStore() {
    const [count, setCount] = signal(0)
    
    return {
      count
    }
  }

  const useGlobalStore = createStore(GlobalStore)

  function CounterStore(props) {
    const globalStore = useGlobalStore()
    const [count, setCount] = signal(Math.max(props.initialCount(), globalStore.count()))

    const interval = setInterval(() => {
      setCount(current => current + 1)
    }, 1000)

    cleanup(() => clearInterval(interval))

    return {
      count
    }
  }

  const useCounterStore = createStore(CounterStore)

  function Counter() {
    using _ = useObserver()
    
    const { count } = useCounterStore()

    return <h2>Count {count()}</h2>
  }

  function Page() {
    return (
      <useCounterStore.Provider initialCount={10}>
        <Counter />
      </useCounterStore.Provider>  
    )
  }

  export default function App() {
    return (
      <useGlobalStore.Provider>
        <Page />
      </useGlobalStore.Provider>
    )
  }
---

# Nested Stores

As **Impact** builds on the existing React context you will be able to instantiate state management related to specific pages, features or even for each item in a list.

The store can receive props from React. These props are received as signals. This is because React might update the props through reconciliation. You can use the props at any time inside the store and also expose them from the store to be used in nested components or stores.

```ts
import { createStore, cleanup, signal } from "impact-react";

export const useAppStore = createStore(AppStore);

function AppStore(props) {
  const [count, setCount] = signal(props.initialCount());

  return {
    count,
    user: props.user,
  };
}
```

The provided store can be consumed from nested components, but also other nested stores. Think of the stores as traditional React context behaviour, but with primitives improving performance and developer experience.

::: tip

Another aspect of scoping state management is related to typing. Global state management typically defines `null` values for uninitialized state. With [strict null checking](https://www.typescriptlang.org/tsconfig/strictNullChecks.html) enabled you are likely to find your code having many non functional `if` statements to please the type checker. This does not happen in Impact because a store is only initialized when its dependent state is available.

:::

<ClientOnly>
 <Playground />
</ClientOnly>
