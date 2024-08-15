---
codeCaption: An observable context
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

<ClientOnly>
  <Playground />
</ClientOnly>

Moving back to our initial example we implement the same `count` and `increase` using **Impact**. A traditional React context depends on the reconciliation loop, but **Impact** provides an observation context, called a **Store**. The store is just a function where you are free to instantiate classes, assign local variables, start subscriptions, pretty much whatever you want. The function will **not** reconcile, it only runs once.

The `useStore` function can be used inside components, and other stores, to consume a store. Stores are global by default.

::: info

The reason Impact uses the new [Explicit Resource Management](https://medium.com/@bagherani/ecmascript-explicit-resource-management-early-implementation-in-typescript-5-2-5e4d08b2aee3) JavaScript API is because it is the least intrusive API for components. With the `using` keyword there is no need to import an observer function or define your components in a specific way.

When `using` a store it will have an active observer context that is disposed when the component function exits.

:::

::: warning

Impact is not designed for server side rendering. You can use it with server side rendering frameworks like Next JS, but only using client side rendered components.

:::
