---
codeCaption: Cached derived signals
code: |
  import { useStore, signal, derived } from 'impact-react'

  function CounterStore() {
    const count = signal(0)
    const enabled = signal(false)
    const multipliedCount = derived(() =>
      enabled.value ?
        count.value * 4 : count.value * 2
    )

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
      },
      get multipliedCount() {
        return multipliedCount.value
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

  function Multiplier() {
    using counterStore = useCounterStore()
    const { multipliedCount } = counterStore

    return <h3>Multiplied: {multipliedCount}</h3>
  }

  export default function App() {
    return (
      <div css={{ display: 'flex', flexDirection: 'column' }}>
        <Counter />
        <Enabler />
        <Multiplier />
      </div>
    )
  }
---

# Derived

<ClientOnly>
  <Playground />
</ClientOnly>

Derived signals will calculate a value based on other signals and cache it. The benefit `derived` has over `useMemo` is that it does not immediately recalculate when a dependent signal changes, but rather flag itself as dirty. Only when the value is accessed it will recompute the value.

Derived is consumed just like a plain signal, using the `.value` property. You can **not** assign a value to a derived.
