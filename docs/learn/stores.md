---
codeCaption: Introducing stores
code: |
  import { useStore, store } from 'impact-react'

  function CounterStore() {
    const counter = store({
        count: 0,
        get doubleCount() {
            return counter.count * 2
        },
        enabled: false,
        increase() {
            counter.count++
        },
        toggleEnabled() {
            counter.enabled = !counter.enabled
        }
    })

    // It is common to use the "readonly" method of a store
    // to return a readonly version of it to components
    return counter.readonly()
  }

  const useCounterStore = () => useStore(CounterStore)

  function Counter() {
    using counterStore = useCounterStore()

    const { count, increase } = counterStore

    return (
      <button onClick={increase}>
        Increase ({count})
      </button>
    )
  }

  function Enabler() {
    using counterStore = useCounterStore()

    const { enabled, toggleEnabled } = counterStore

    return (
      <button onClick={toggleEnabled}>
        {enabled ? "Disable" : "Enable"}
      </button>
    )
  }

  export default function App() {
    return <>
      <Counter />
      <Enabler />
    </>
  }
---

# Stores

Now that you have learned about the low level [signal](../signal.md) and [derived](../derived.md) we can introduce a higher abstraction called `store`. A store is just an object where the keys are converted into signals (values) and derived (getters) under the hood. The immediate benefit of this is that you will access the keys of the store object as opposed to the signal `.value`. A `readonly` method is also available to expose the store in a readonly mode, which is recommended.

<ClientOnly>
  <Playground />
</ClientOnly>

:::tip
As your stores grow you can take advantage of the same hooks pattern as React to allow full flexibility in composition.

```ts
function useCounter() {
  const counter = store({
    count: 0,
    increase() {
      counter.count++
    }
  })

  return counter
}

function useShouter() {
  const shouter = store({
    shout: "",
    updateShout(shout) {
      shouter.shout = shout
    }
  })

  return shouter
}

function AppStore() {
    const counter = useCounter()
    const shouter = useShouter()

    effect(() => {
      if (counter.count === 10) {
        shouter.updateShout("Oh my, we hit 10!!!")
      }
    })

    return {
        counter: counter.readonly(),
        shouter: shouter.readonly()
    }
}
```
:::