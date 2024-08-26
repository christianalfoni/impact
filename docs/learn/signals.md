---
codeCaption: Signals
code: |
  import { signal, createStore, useObserver } from 'impact-react'

  function CounterStore() {
    const [count, setCount] = signal(0)
    const [enabled, setEnabled] = signal(false)

    return {
      count,
      enabled,
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
    
    const { count, increase } = useStore(CounterStore)

    return (
      <button onClick={increase}>
        Increase ({count()})
      </button>
    )
  }

  function Enabler() {
    using _ = useObserver()
    
    const { enabled, enable } = useStore(CounterStore)

    return (
      <button onClick={enable}>
        {enabled() ? "Enabled" : "Enable"}
      </button>
    )
  }

  export default function App() {
    return (
      <useCounterStore.Provider>
        <Counter />
        <Enabler />
      </useCounterStore.Provider>
    )
  }
---

# Signals

`signal` is the primitive representing an observable value.

```ts
import { signal } from "impact-react";

// Create signal
const [count, setCount] = signal(0);

// Unwrap value
const value = count();

// Set value
setCount(1);

// Update value
setCount((current) => current + 1);
```

The signal has the same interface as `useState`, only you need to unwrap the value. When unwrapping a value in a component, it will automatically observe any changes to that value. It does not matter how many signals are exposed through the store; only the ones accessed in a component will cause that component to reconcile. Just like `useState`, the value of a signal is considered immutable and needs to _strictly_ change its value to trigger observation.

::: info

The API of a signal is inspired by [Solid JS](https://www.solidjs.com/). It was chosen for the following reasons:

- Using a `.get/.set/.update` imperative API does not match the paradigm of functional React
- Using a `.value` getter/setter fits the paradigm, but bloats the code with a lot of `.value` references, making it harder to read what is being accessed and changed
- Splitting getting and setting the value encourages signals being exposed as `readonly` values from the store, where you explicitly define methods to change them from the outside, when needed
- It is always clear when you are consuming a signal... you call the value to unwrap it. This is especially important in component code to indicate where observation happens

:::

::: tip

[Immer](https://immerjs.github.io/immer/) is a popular tool to update complex objects in React. You can use it the same way with signals.

```ts
import { signal } from "impact-react";
import { produce } from "immer";

const [list, setList] = signal([]);

setList(
  produce((draft) => {
    draft.push("foo");
  }),
);
```

:::

<ClientOnly>
  <Playground />
</ClientOnly>
