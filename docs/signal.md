---
outline: deep
---

# signal

Observable state. The value is considered immutable. If set with the same value, the signal will not trigger. You can set a new value directly or use a callback where you receive the current value, which returns the new value.

```ts
import { signal } from "impact-react";

function CounterStore() {
  const count = signal(0);

  return {
    get count() {
      return count();
    },
    increase() {
      count((current) => current + 1);
    },
    setCount(newCount) {
      count(newCount);
    },
  };
}
```

## Promises

Assigning a promise to a signal will enhance that promise to comply with React's [use](https://react.dev/reference/react/use) specification. That means the promise will expose a `.status` property and related `.value` or `.reason`, depending on its resolvement.

```tsx
import { signal, useStore } from "impact-react";

function AsyncStore() {
  const asyncValue = signal(createSomePromise());

  return {
    get asyncValue() {
      return asyncValue();
    },
  };
}

function App() {
  using asyncStore = useStore(AsyncStore);

  const asyncValue = asyncStore.asyncValue;

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
  using asyncStore = useAsyncStore();
  const value = use(asyncStore.asyncValue);

  return "Yeah, " + value;
}
```

::: tip

When a signal consumes a promise the browser will not throw an **Unhandled Promise Rejection** if it fails. The reason is that you might "handle" the rejection declaratively in a component. The promise does stay rejected though and if you use the `await` keyword on it, it will throw. It is still just a promise.

:::
