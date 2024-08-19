---
codeCaption: Using effects
code: |
  import { signal, effect, useStore } from 'impact-react'

  function CounterStore() {
    const count = signal(0)
    const shouldAlert = signal(false)

    effect(() => {
      if (count() === 5 && shouldAlert()) {
        alert("You hit 5, yeah")
      }
    })

    return {
      get count() {
        return count()
      },
      get shouldAlert() {
        return shouldAlert()
      },
      increase() {
        count(current => current + 1)
      },
      toggleShouldAlert() {
        shouldAlert(current => !current)
      }
    }
  }

  export default function App() {
    using counterStore = useStore(CounterStore)

    return (
      <>
        <button onClick={counterStore.increase}>
          Increase ({counterStore.count})
        </button>
        <button onClick={counterStore.toggleShouldAlert}>
          Will {counterStore.shouldAlert ? '' : 'not '}alert
        </button>
      </>
    )
  }
---

# Effects

**Impact** effects allow you to run logic related to signal changes observed in the effect. You can safely change signal values from effects.

Unlike `useEffect`, the **Impact** `effect` is not intended as a way to subscribe to other sources of state. You do not need it; subscriptions can be defined with the rest of your signals. Actually, the use of effects is discouraged because they create indirection in your code. For example:

```ts
function CounterStore() {
  const count = signal(0);

  effect(() => {
    if (count() === 10) {
      alert("you gotz to 10");
    }
  });

  return {
    get count() {
      return count();
    },
    increase() {
      count((current) => current + 1);
    },
  };
}
```

Instead, you can write the same logic as:

```ts
function CounterStore() {
  const count = signal(0);

  return {
    get count() {
      return count();
    },
    increase() {
      const newCount = count((current) => current + 1);

      if (newCount === 10) {
        alert("you gotz to 10");
      }
    },
  };
}
```

Now, we have co-located where the count changes and what effect can happen because of that change. This makes it easier for the next developer (including you in the future) to understand what happens when `increase` is called.

Avoiding effects generally improves the readability and understanding of what happens when state changes. An effect can be useful if multiple locations are updating the same state and you want some effect to happen regardless of where the state changed from. Another scenario is when you rely on mulitple signals to run an effect.

<ClientOnly>
 <Playground />
</ClientOnly>
