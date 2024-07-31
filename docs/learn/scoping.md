---
codeCaption: Scoping stores
code: |
  import { signal, useStore, createStoreProvider, cleanup, observer } from 'impact-react'

  function CounterStore({ initialCount }) {
    const count = signal(initialCount)

    const interval = setInterval(() => {
      count(current => current + 1)
    }, 1000)

    cleanup(() => clearInterval(interval))

    return {
      get count() {
        return count()
      }
    }
  }

  const useCounterStore = () => useStore(CounterStore)
  const CounterStoreProvider = createStoreProvider(CounterStore)

  const Counter = observer(() => {
    const { count } = useCounterStore()

    return <h2>Count {count}</h2>
  })

  const App = () => {
    return (
      <CounterStoreProvider initialCount={10}>
        <Counter />
      </CounterStoreProvider>
    )
  }

  export default App
---

# Scoping

<ClientOnly>
 <Playground />
</ClientOnly>

By default the stores are global, but you can scope them to specific component trees by using a provider.

You create a provider for a store using the `createStoreProvider` function. The store is instantiated when the provider mounts and any `cleanup` is called when the provider unmounts.

Scoping stores allows you to instantiate state management related to specific pages, features or even for each item in a list. You can start subscriptions and instantiate classes which can be disposed with `cleanup` when unmounting the provider.

Additionally the store can now receive props from the provider to initialise itself. This is especially useful to take advantage of modern React async patterns, as you will see later.

::: tip

Another aspect of scoping state management is related to typing. Global state management typically defines `null` values for uninitialized state. With [strict null checking](https://www.typescriptlang.org/tsconfig/strictNullChecks.html) enabled you will have a lot of `if` statements in your code just to please the type checker. There is a misalignment with you and your code. This does not happen in Impact because of scoped stores.

:::
