---
outline: deep
---

# signal

Observable values. The value is considered immutable. If set with the same value, the signal will not trigger. You can set a new value directly or use a callback where you receive the current value, which returns the new value.

```ts
import { signal } from "@impact-react/signals";

function CounterStore() {
  const [count, setCount] = signal(0);

  return {
    count,
    increase() {
      setCount((current) => current + 1);
    },
    reset() {
      count(0);
    },
  };
}
```

## Promises

Assigning a promise to a signal will enhance that promise to comply with React's [use](https://react.dev/reference/react/use) specification. That means the promise will expose a `.status` property and related `.value` or `.reason`, depending on its resolvement.

```tsx
import {
  signal,
  createReactiveContext,
  useObserver,
} from "@impact-react/signals";

function AsyncStore() {
  const [asyncValue] = signal(createSomePromise());

  return {
    asyncValue,
  };
}

const useAsyncStore = createReactiveContext(AsyncStore);

function App() {
  using _ = useObserver();

  const { asyncValue } = useAsyncStore();
  const currentAsyncValue = asyncValue();

  if (asyncValue.status === "pending") {
    return "Loading...";
  }

  if (asyncValue.status === "rejected") {
    return "Ops, " + asyncValue.reason;
  }

  return "Yeah, " + asyncValue.value;
}
```

Or you could have consumed it with the `use` hook, in combination with a suspense and error boundary.

```tsx
function App() {
  using _ = useObserver();

  const { asyncValue } = useAsyncStore();
  const currentAsyncValue = use(asyncValue());

  return "Yeah, " + currentAsyncValue;
}
```

::: tip

When a signal consumes a promise the browser will not throw an **Unhandled Promise Rejection** if it fails. The reason is that you might "handle" the rejection declaratively in a component. The promise does stay rejected though and if you use the `await` keyword on it, it will throw. It is still just a promise.

:::
