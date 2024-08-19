---
codeCaption: Signals
code: |
  import { signal, useStore } from 'impact-react'

  function CounterStore() {
    const count = signal(0)
    const enabled = signal(false)

    return {
      get count() {
        return count()
      },
      get enabled() {
        return enabled()
      },
      increase() {
        count(current => current + 1)
      },
      enable() {
        enabled(true)
      }
    }
  }

  function Counter() {
    using counterStore = useStore(CounterStore)

    return (
      <button onClick={counterStore.increase}>
        Increase ({counterStore.count})
      </button>
    )
  }

  function Enabler() {
    using counterStore = useStore(CounterStore)

    return (
      <button onClick={counterStore.enable}>
        {counterStore.enabled ? "Enabled" : "Enable"}
      </button>
    )
  }

  export default function App() {
    return (
      <>
        <Counter />
        <Enabler />
      </>
    )
  }
---

# Signals

`signal` is the primitive representing an observable value.

```ts
import { signal } from "impact-react";

// Create signal
const count = signal(0);

// Unwrap value
const value = count();

// Set value
count(1);

// Update value
count((current) => current + 1);
```

The signal itself is a function and you call it to unwrap the value. When unwrapping a value in a component, it will automatically observe any changes to that value. It does not matter how many signals are exposed through the store; only the ones accessed in a component will cause that component to reconcile. Just like `useState`, the value of a signal is considered immutable and needs to _strictly_ change its value to trigger observation.

::: info

The API of a signal is inspired by [Solid JS](https://www.solidjs.com/). It was chosen for the following reasons:

- Using a `.get/.set/.update` imperative API does not match the paradigm of functional React
- Using a `.value` getter/setter fits the paradigm, but bloats the code with a lot of `.value` references, making it harder to read what is being accessed and changed
- The function API just adds a couple of parenthesis and keeps the naming of the signal clear and concise in the code. It also naturally enables the use of a callback to update the value

:::

When exposing signals from a store it is common to use `getters`, meaning that unwrapping the value becomes implicit when consuming a signal from a component or a nested store.

```ts
import { signal } from "impact-react";

function AppStore() {
  const count = signal(0);

  return {
    get count() {
      return count();
    },
  };
}
```

::: tip

[Immer](https://immerjs.github.io/immer/) is a popular tool to update complex objects in React. You can use it the same way with signals.

```ts
import { signal } from "impact-react";
import { produce } from "immer";

const list = signal([]);

list(
  produce((draft) => {
    draft.push("foo");
  }),
);
```

:::

<ClientOnly>
  <Playground />
</ClientOnly>
