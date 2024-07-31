---
codeCaption: A reactive store
code: |
  import { useStore, signal, observer } from 'impact-react'

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

  const App = observer(() => {
    const counter = useStore(CounterStore)

    return (
      <button onClick={counter.increase}>
        Increase ({counter.count})
      </button>
    )
  })

  export default App
---

# Store

<ClientOnly>
  <Playground />
</ClientOnly>

Moving back to our initial example we implement the same `count` and `increase` using **Impact**. A traditional React context depends on the reconciliation loop, but **Impact** provides a reactive context, called a **Store**. The store is just a function where you are free to instantiate classes, assign local variables, start subscriptions, pretty much whatever you want. The function will **not** reconcile, it only runs once.

The `useStore` is used inside components to consume a reactive context returning a store, and they are global by default.
