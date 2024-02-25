---
codeCaption: Creating a Store
code: |
    import { useStore, signal } from 'impact-react'

    function CounterStore() {
        const count = signal(0)

        return {
            get count() {
                return count.value
            },
            increase() {
                count.value++
            }
        }
    }

    export default function App() {
      const { count, increase } = useStore(CounterStore)

      return (
        <button onClick={increase}>
          Increase ({count})
        </button>
      )
    }
---

# Store

Moving back to our initial example we implement an **Impact** store with the same `count` and `increase`.  Stores in **Impact** is defined as a function, just like a hook. In the scope of this function you are free to instantiate classes, assign local variables, start subscriptions, pretty much whatever you want. You will also be able to use the reactive primitives of **Impact**. What you return from this function will be exposed from the store. This function will **not** reconcile, it only runs once.

The `useStore` is used inside components to consume **Impact** stores and they are global by default.

<ClientOnly>
  <Playground />
</ClientOnly>