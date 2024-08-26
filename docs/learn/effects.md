---
codeCaption: Using effects
code: |
  import { signal, effect, createStore, useObserver } from 'impact-react'

  function CounterStore() {
    const [count, setCount] = signal(0)
    const [shouldAlert, setShouldAlert] = signal(false)

    effect(() => {
      if (count() === 5 && shouldAlert()) {
        alert("You hit 5, yeah")
      }
    })

    return {
      count,
      shouldAlert,
      increase() {
        setCount(current => current + 1)
      },
      toggleShouldAlert() {
        setShouldAlert(current => !current)
      }
    }
  }

  const useCounterStore = createStore(CounterStore)

  function Counter() {
    using _ = useObserver()
    
    const { count, increase, shouldAlert, toggleShouldAlert } = useStore(CounterStore)

    return (
      <>
        <button onClick={increase}>
          Increase ({count()})
        </button>
        <button onClick={toggleShouldAlert}>
          Will {shouldAlert() ? '' : 'not '}alert
        </button>
      </>
    )
  }

  function App() {
    return (
      <useCounterStore.Provider>
        <Counter />
      </useCounterStore.Provider>
    )
  }
---

# Effects

**Impact** effects allow you to run logic related to signal changes observed in the effect. You can safely change signal values from effects.

Unlike `useEffect`, the **Impact** `effect` is not intended as a way to subscribe to other sources of state. You do not need it; subscriptions can be defined with the rest of your signals. Actually, the use of effects is discouraged because they create indirection in your code. For example:

```ts
function CounterStore() {
  const [count, setCount] = signal(0);

  effect(() => {
    if (count() === 10) {
      alert("you gotz to 10");
    }
  });

  return {
    count,
    increase() {
      setCount((current) => current + 1);
    },
  };
}
```

Instead, you can write the same logic as:

```ts
function CounterStore() {
  const [count, setCount] = signal(0);

  return {
    count,
    increase() {
      const newCount = setCount((current) => current + 1);

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
