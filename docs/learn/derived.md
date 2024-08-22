---
codeCaption: Derived signals
code: |
  import { signal, derived, useStore, observer } from 'impact-react'

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

  const Counter = observer(function Counter() {
    const { count, increase } = useStore(CounterStore)

    return (
        <button onClick={increase}>
        Increase ({count})
        </button>  
    )
  })

  const Enabler = observer(function Enabler() {
    const { enabled, enable } = useStore(CounterStore)

    return (
        <button onClick={enable}>
        {enabled ? "Enabled" : "Enable"}
        </button>
    )
  })

  const Multiplier = observer(function Multiplier() {
    const { multipliedCount } = useStore(CounterStore)

    return (
        <h3>Multiplied: {multipliedCount}</h3>
    )
  })

  export default function App() {
    return (
      <div>
        <Counter />
        <Enabler />
        <Multiplier />
      </div>
    )
  }
---

# Derived

Derived signals will calculate a value based on other signals and cache it. The benefit `derived` has over `useMemo` is that it does not immediately recalculate when a dependent signal changes, but rather flags itself as dirty. Only when the value is accessed will it recompute the value.

Derived is consumed just like a plain signal, but you can **not** update a value of `derived`.

<ClientOnly>
  <Playground />
</ClientOnly>
