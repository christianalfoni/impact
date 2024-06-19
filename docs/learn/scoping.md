---
codeCaption: Scoping stores
code: |
  import { useStore, store, createStoreProvider, cleanup } from 'impact-react'

  function CounterStore({ initialCount }) {
    const counter = store({
      count: initialCount
    })

    const interval = setInterval(() => {
      counter.count++
    }, 1000)

    cleanup(() => clearInterval(interval))

    return counter
  }

  const CounterStoreProvider = createStoreProvider(CounterStore)

  function Counter() {
    using counterStore = useStore(CounterStore)

    return <h2>Count {counterStore.count}</h2>
  }

  export default function App() {
    return (
      <CounterStoreProvider initialCount={10}>
        <Counter />
      </CounterStoreProvider>
    )
  }
---

# Scoping

<ClientOnly>
 <Playground />
</ClientOnly>

Stores are global by default, but you can scope them to specific component trees by using a provider.

You create a provider for a store using the `createStoreProvider` function. The store is instantiated when the provider mounts and any `cleanup` is called when the provider unmounts.

Scoping stores allows you to instantiate state management related to specific pages, features, or even each item on a list. You can start subscriptions and instantiate classes that can be disposed of with `cleanup` when unmounting the provider. The store can now also receive props from the provider to initialize itself. As you will see next, this is especially useful for taking advantage of modern React data fetching patterns.

Another aspect of scoping state management is related to typing. When you scope state management, you can receive resolved asynchronous state as a prop. The consumers of scoped state management can safely consume resolved asynchronous state, instead of having to check if the state is there, is pending, or has an error.
