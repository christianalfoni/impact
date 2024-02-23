---
codeCaption: Using effects
code: |
  import { store, signal, effect } from 'impact-react'

  const useStore = store(() => {
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
  })

  function Counter() {
    const { count, increase } = useStore()

    return (
      <button onClick={increase}>
        Increase ({count})
      </button>
    )
  }

  export default function App() {
    return <Counter />
  }
---

# Effects

**Impact** effects allows you to run logic related to signal changes observed in the effect. You can safely change signal values from effects and you'll always access the current value of any signal you access.

<ClientOnly>
 <Playground />
</ClientOnly>