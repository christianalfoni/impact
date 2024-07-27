---
codeCaption: Cached derived signals
code: |
  import { signal, derived, observe } from 'impact-react'

  function createApp() {
    const count = signal(0)
    const enabled = signal(false)
    const multipliedCount = derived(() =>
      enabled() ?
        count() * 4 : count() * 2
    ))

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

  const app = createApp()

  const Counter = observe(() => (
    <button onClick={app.increase}>
      Increase ({app.count})
    </button>  
  ))

  const Enabler = observe(() => (
    <button onClick={app.enable}>
      {app.enabled ? "Enabled" : "Enable"}
    </button>
  ))

  const Multiplier = observe(() => (
    <h3>Multiplied: {app.multipliedCount}</h3>
  ))

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
