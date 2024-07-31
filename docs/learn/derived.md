---
codeCaption: Cached derived signals
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

  const useCounterStore = () => useStore(CounterStore)

  const Counter = observer(() => {
    const { increase, count } = useCounterStore()

    return (
        <button onClick={increase}>
        Increase ({count})
        </button>  
    )
  })

  const Enabler = observer(() => {
    const { enable, enabled } = useCounterStore()

    return (
        <button onClick={enable}>
        {enabled ? "Enabled" : "Enable"}
        </button>
    )
  })

  const Multiplier = observer(() => {
    const { multipliedCount } = useCounterStore()

    return (
        <h3>Multiplied: {multipliedCount}</h3>
    )
  })

  const App = () => {
    return (
      <div css={{ display: 'flex', flexDirection: 'column' }}>
        <Counter />
        <Enabler />
        <Multiplier />
      </div>
    )
  }

  export default App
---

# Derived

<ClientOnly>
  <Playground />
</ClientOnly>

Derived signals will calculate a value based on other signals and cache it. The benefit `derived` has over `useMemo` is that it does not immediately recalculate when a dependent signal changes, but rather flags itself as dirty. Only when the value is accessed will it recompute the value.

Derived is consumed just like a plain signal, but you can **not** update a value of `derived`.
