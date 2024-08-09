---
codeCaption: Scoping stores
code: |
  import { signal, useStore, createStoreProvider, cleanup } from 'impact-react'

  function CounterStore(props) {
    const count = signal(props.initialCount())

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

By default the stores are global, but you can scope them to specific component trees by using a provider.

You create a provider for a store using the `createStoreProvider` function. The store is instantiated when the provider mounts and any `cleanup` is called when the provider unmounts.

Scoping stores allows you to instantiate state management related to specific pages, features or even for each item in a list. You can start subscriptions and instantiate classes which can be disposed with `cleanup` when unmounting the provider.

With a provider the store can receive props as signals from React to initialise itself. You choose if you want to just unwrap the props signal to use it as an initial value, or if you want to keep it as React updates it through reconciliation.

Receiving props from React is especially useful to take advantage of modern React async patterns. The feature also allows you to bind a store to state, for example a store that provides functionality to edit a specific ticket in your project management app.

::: tip

Another aspect of scoping state management is related to typing. Global state management typically defines `null` values for uninitialized state. With [strict null checking](https://www.typescriptlang.org/tsconfig/strictNullChecks.html) enabled you are likely to find your code having many non functional `if` statements to please the type checker. This does not happen in Impact because a store is only initialized when its dependent state is available.

:::
