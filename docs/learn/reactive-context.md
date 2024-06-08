---
codeCaption: A reactive context
code: |
  import { useStore, store } from 'impact-react'

  function CounterStore() {
      const counter = store({
        count: 0,
        increase() {
          counter.count++
        }
      })

      return counter
  }

  export default function App() {
    using counterStore = useStore(CounterStore)

    const { count, increase } = counterStore

    return (
      <button onClick={increase}>
        Increase ({count})
      </button>
    )
  }
---

# Reactive context

Moving back to our initial example we implement the same `count` and `increase` using **Impact**. A traditional React context depends on the reconciliation loop, but **Impact** provides a reactive context. The reactive context is just a function where you are free to instantiate classes, assign local variables, start subscriptions, pretty much whatever you want. We use the term _reactive context_ and _store_ interchangibly, as the reactive context represents a store. The function will **not** reconcile, it only runs once.

The `useStore` is used inside components to consume a reactive context returning a store, and they are global by default. The `using` keyword is a JavaScript feature that enables the component to track access to signals in the component scope. With the `using` keyword there is a single way to achieve observability and it does not affect how you define or export your components.

<ClientOnly>
  <Playground />
</ClientOnly>
