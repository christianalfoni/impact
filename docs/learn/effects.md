---
codeCaption: Using effects
code: |
  import { useStore, store, effect } from 'impact-react'

  function CounterStore() {
    const counter = store({
      count: 0,
      shouldAlert: false,
      increase() {
        counter.count++
      },
      toggleShouldAlert() {
        counter.shouldAlert = !counter.shouldAlert
      }
    })

    effect(() => {
      if (counter.count === 5 && counter.shouldAlert) {
        alert("You hit 5, yeah")
      }
    })

    return counter
  }

  export default function App() {
    using counterStore = useStore(CounterStore)

    const { count, increase, shouldAlert, toggleShouldAlert } = counterStore

    return (
      <>
        <button onClick={increase}>
          Increase ({count})
        </button>
        <button onClick={toggleShouldAlert}>
          Will {shouldAlert ? '' : 'not '}alert
        </button>
      </>
    )
  }
---

# Effects

<ClientOnly>
 <Playground />
</ClientOnly>

**Impact** effects allow you to run logic related to signal changes observed in the effect. You can safely change signal values from effects and always get the current value of any signal you access.

Unlike `useEffect`, the **Impact** `effect` is not intended as a way to subscribe to other sources of state. You do not need it; subscriptions can be defined with the store definition itself. Actually, the use of effects is discouraged because they create indirection in your code. For example:

```ts
function CounterStore() {
  const counter = store({
    count: 0,
    increase() {
      counter.count++;
    },
  });

  effect(() => {
    if (counter.count === 10) {
      alert("you gotz to 10");
    }
  });

  return counter;
}
```

Instead, you can write the same logic as:

```ts
function CounterStore() {
  const counter = store({
    count: 0,
    increase() {
      counter.count++;

      if (counter.count === 10) {
        alert("you gotz to 10");
      }
    },
  });

  return counter;
}
```

Now, we have co-located where the count changes and what effect can happen because of that change. This makes it easier for the next developer (including you in the future) to understand what happens when `increase` is called.

Avoiding effects generally improves the readability and understanding of what happens when state changes. An effect can be useful if multiple locations are updating the same state and you want some effect to happen regardless of where the state changed. Another scenario is when you rely on mulitple signals and need to verify running an effect if any of the signals change.
