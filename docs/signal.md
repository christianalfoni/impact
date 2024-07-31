---
outline: deep
---

# signal

Reactive state. The value is considered immutable. If set with the same value, the signal will not trigger. You can set a new value directly or use a callback where you receive the current value, which returns the new value. The callback is executed by [Immer](https://immerjs.github.io/immer/) and allows you to use the normal JavaScript mutation API for complex objects.

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
import { signal, observer, useStore } from "impact-react";

function AsyncStore() {
  const asyncValue = signal(createSomePromise());

  return {
    get asyncValue() {
      return asyncValue();
    },
  };
}

const useAsyncStore = () => useStore(AsyncStore);

const App = observer(() => {
  const { asyncValue } = useAsyncStore();

  if (asyncValue.status === "pending") {
    return "Loading...";
  }

  if (asyncValue.status === "rejected") {
    return "Ops, " + asyncValue.reason;
  }

  return "Yeah, " + asyncValue.value;
});
```

Or you could have consumed it with the `use` hook, in combination with a suspense and error boundary.

```tsx
const App = observer(() => {
  const { asyncValue } = useAsyncStore();
  const value = use(asyncValue);

  return "Yeah, " + value;
});
```

::: tip

The signal will catch the error of the promise to set its new status, but will then reject the promise with the original reason. To **catch** an error, you should either use async try/catch when assigning the promise to a signal, or use a `catch` on the promise returned from the signal.

:::
