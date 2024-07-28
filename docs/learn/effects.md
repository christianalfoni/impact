---
codeCaption: Using effects
code: |
  import { signal, effect, observe } from 'impact-react'

  function createApp() {
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
      increase() {
        count(current => current + 1)
      },
      toggleShouldAlert() {
        shouldAlert(current => !current)
      }
    }
  }

  const app = createApp()

  const App = observe(() => (
    <>
      <button onClick={app.increase}>
        Increase ({app.count})
      </button>
      <button onClick={app.toggleShouldAlert}>
        Will {app.shouldAlert ? '' : 'not '}alert
      </button>
    </>
  ))

  export default App
---

# Effects

<ClientOnly>
 <Playground />
</ClientOnly>

**Impact** effects allow you to run logic related to signal changes observed in the effect. You can safely change signal values from effects.

Unlike `useEffect`, the **Impact** `effect` is not intended as a way to subscribe to other sources of state. You do not need it; subscriptions can be defined with the rest of your signals. Actually, the use of effects is discouraged because they create indirection in your code. For example:

```ts
function createApp() {
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
function createApp() {
  const count = signal(0);

  return {
    get count() {
      return count();
    },
    increase() {
      count((current) => current + 1);

      if (count() === 10) {
        alert("you gotz to 10");
      }
    },
  };
}
```

Now, we have co-located where the count changes and what effect can happen because of that change. This makes it easier for the next developer (including you in the future) to understand what happens when `increase` is called.

Avoiding effects generally improves the readability and understanding of what happens when state changes. An effect can be useful if multiple locations are updating the same state and you want some effect to happen regardless of where the state changed. Another scenario is when you rely on mulitple signals and need to verify running an effect if any of the signals change.
