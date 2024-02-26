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

Unlike `useEffect`, the **Impact** `effect` is not strictly a way to synchronize state from external stores. You do not need an effect to start a subscription for example.

<ClientOnly>
 <Playground />
</ClientOnly>

::: tip

Try to avoid using effects. Effects creates indirection in your code. For example:

```ts
function CountStore() {
  const count = signal(0)

  effect(() => {
    if (count.value === 10) {
      alert("you gotz to 10")
    }
  })

  return {
    get count() {
      return count.value
    },
    increase() {
      count.value++
    }
  }
}
```

You can rather write the same logic as:

```ts
function CountStore() {
  const count = signal(0)

  return {
    get count() {
      return count.value
    },
    increase() {
      count.value++

      if (count.value === 10) {
        alert("you gotz to 10")
      }
    }
  }
}
```

Now we have co located where the count actually changes and what effect that can happen because of that change.

Avoiding effects generally improves readability and understanding of what happens when state changes. An effect can be useful if multiple locations are updating the same state and you want some effect to happen regardless of where the state changed.

:::