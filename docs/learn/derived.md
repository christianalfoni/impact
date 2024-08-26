---
codeCaption: Derived signals
code: |
  import { signal, derived, createStore, useObserver } from 'impact-react'

  function CounterStore() {
    const [count, setCount] = signal(0)
    const [enabled, setEnabled] = signal(false)
    const multipliedCount = derived(() =>
      enabled() ? count() * 4 : count() * 2
    )

    return {
      count,
      enabled,
      multipliedCount,
      increase() {
        setCount(current => current + 1)
      },
      enable() {
        setEnabled(true)
      }
    }
  }

  const useCounterStore = createStore(CounterStore)

  function Counter() {
    using _ = useObserver()
    
    const { count, increase } = useCounterStore()

    return (
      <button onClick={increase}>
        Increase ({count()})
      </button>  
    )
  }

  function Enabler() {
    using _ = useObserver()
    
    const { enabled, enable } = useCounterStore()

    return (
      <button onClick={enable}>
        {enabled() ? "Enabled" : "Enable"}
      </button>
    )
  }

  function Multiplier() {
    using _ = useObserver()
    
    const { multipliedCount } = useCounterStore()

    return (
      <h3>Multiplied: {multipliedCount()}</h3>
    )
  }

  export default function App() {
    return (
      <useCounterStore.Provider>
        <Counter />
        <Enabler />
        <Multiplier />
      </useCounterStore.Provider>
    )
  }
---

# Derived

Derived signals will calculate a value based on other signals and cache it. The benefit `derived` has over `useMemo` is that it does not immediately recalculate when a dependent signal changes, but rather flags itself as dirty. Only when the value is accessed will it recompute the value.

Derived is consumed just like a plain signal, but you can **not** update a value of `derived`.

<ClientOnly>
  <Playground />
</ClientOnly>
