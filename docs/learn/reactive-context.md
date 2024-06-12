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

Moving back to our initial example we implement the same `count` and `increase` using **Impact**. A traditional React context is instantiated within a component function and is affected by the reconciliation loop. In **Impact** we have a reactive context which is **not** affected by the reconciliation loop. That means the function providing the reactive context is called **once**. You are free to instantiate classes, assign local variables, start subscriptions, pretty much whatever you want in this function before returning the reactive context. We use the term _reactive context_ and _store_ interchangibly, as the reactive context represents a store.

The `useStore` hook is used inside components to consume a store, and they are global by default. The `using` keyword is a JavaScript feature that enables the component to track access to signals in the component scope. With the `using` keyword there is a single way to achieve observability and it does not affect how you define or export your components.

<ClientOnly>
  <Playground />
</ClientOnly>
