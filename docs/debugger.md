---

code: |
  import { useStore, signal } from 'impact-react'
  import 'impact-react-debugger'

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
    const { count, increase } = useCounterStore()

    return (
      <button onClick={increase}>
        Increase ({count})
      </button>
    )
  }

  export default function App() {
    return <>
      <Counter />
    </>
  }
---

# debugger

<ClientOnly>
 <Playground />
</ClientOnly>