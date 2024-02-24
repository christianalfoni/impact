---
codeCaption: Using effects
code: |
  import { useStore, signal, effect } from 'impact-react'

  function CounterStore() {
    const count = signal(0)

    effect(() => console.log(count.value))

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

# Effects

**Impact** effects allows you to run logic related to signal changes observed in the effect. You can safely change signal values from effects and you'll always access the current value of any signal you access.

<ClientOnly>
 <Playground />
</ClientOnly>