---
codeCaption: Introducing signals
code: |
  import { useStore, signal } from 'impact-react'

  function CounterStore() {
    const count = signal(0)
    const enabled = signal(false)

    return {
      get count() {
        return count.value
      },
      get enabled() {
        return enabled.value
      },
      increase() {
        count.value++
      },
      toggleEnabled() {
        enabled.value = !enabled.value
      }
    }
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

# Signals

`signal` is the primitive you use to define state. When a component accesses the `.value` of a signal during its reconciliation, it will automatically observe any changes to that value. It does not matter how many signals are exposed through the store, only the ones actually accessed in a component will cause that component to reconcile.

Just like `useState` the value of a signal is considered immutable and needs to *strictly* change the `.value` to trigger observation.


<ClientOnly>
  <Playground />
</ClientOnly>

As the example shows it is common to expose signals using `getters`, meaning that accessing `.value` becomes implicit when consuming a signal from a component.
