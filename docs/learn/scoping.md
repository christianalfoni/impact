---
codeCaption: Scoping stores
code: |
  import { useStore, signal, createStoreProvider, cleanup } from 'impact-react'

  function CounterStore({ initialCount }) {
    const count = signal(initialCount)
    const interval = setInterval(() => {
      count.value++
    }, 1000)

    cleanup(() => clearInterval(interval))

    return {
      get count() {
        return count.value
      }
    }
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

By default the stores are global, but you can scope them to specific component trees by using a provider.

You create a provider for a store using the `createStoreProvider` function. The store is instantiated when the provider mounts and any `cleanup` is called when the provider unmounts.

Scoping stores allows you to instantiate state management related to specific pages, features or even for each item in a list. You can start subscriptions and instantiate classes which can be disposed with `cleanup` when unmounting the provider.

Additionally the store can now receive props from the provider to initialise itself. This is especially useful to take advantage of modern React data fetching patterns, as you will see next.

<ClientOnly>
 <Playground />
</ClientOnly>

::: tip

Another aspect of scoping state management is related to typing. When you scope state management you can receive resolved asynchronous state as a prop. The consumers of scoped state management can safely consume resolved asynchronous state, instead of having to check if the state is there, is pending or has an error.

:::