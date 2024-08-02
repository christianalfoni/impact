---
codeCaption: Cached derived signals
code: |
  import { signal, derived, useStore } from 'impact-react'

  function CounterStore() {
    const count = signal(0)
    const enabled = signal(false)
    const multipliedCount = derived(() =>
      enabled() ?
        count() * 4 : count() * 2
    )

    return {
      get count() {
        return count()
      },
      get enabled() {
        return enabled()
      },
      get multipliedCount() {
        return multipliedCount()
      },
      increase() {
        count(current => current + 1)
      },
      enable() {
        enabled(true)
      }
    }
  }

  function Counter() {
    using counterStore = useStore(CounterStore)

    return (
        <button onClick={counterStore.increase}>
        Increase ({counterStore.count})
        </button>  
    )
  }

  function Enabler() {
    using counterStore = useStore(CounterStore)

    return (
        <button onClick={counterStore.enable}>
        {counterStore.enabled ? "Enabled" : "Enable"}
        </button>
    )
  }

  function Multiplier() {
    using counterStore = useStore(CounterStore)

    return (
        <h3>Multiplied: {counterStore.multipliedCount}</h3>
    )
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

Derived signals will calculate a value based on other signals and cache it. The benefit `derived` has over `useMemo` is that it does not immediately recalculate when a dependent signal changes, but rather flags itself as dirty. Only when the value is accessed will it recompute the value.

Derived is consumed just like a plain signal, but you can **not** update a value of `derived`.
