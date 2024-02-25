---
outline: deep
---

# signal

Reactive state. The value is considered immutable and needs to be replaced. If replaced with the same value, the signal will not trigger.

```ts
import { signal } from 'impact-react'

function MyStore() {
  const count = signal(0)

  return {
    get counter() {
      return count.value
    }
  }
}
```

## Promises

Assigning a promise to a signal will enhance that promise to comply with the [use]() specification of React. That means the promise will expose a `.status` property and related `.value` or `.reason`, depending on its resolvement.

```tsx
import { signal, useStore } from 'impact-react'

function MyStore() {
  const asyncValue = signal(createSomePromise())

  return {
    get asyncValue() {
      return asyncValue.value
    }
  }
}

function App() {
  const { asyncValue } = useStore(MyStore)

  if (asyncValue.status === 'pending') {
    return 'Loading...'
  }

  if (asyncValue.status === 'rejected') {
    return 'Ops, ' + asyncValue.reason
  }

  return 'Yeah, ' + asyncValue.value
}
```

Or yoou could have consumed it with the `use` hook, in combination with a suspense and error boundary.

```tsx
function App() {
  const { asyncValue } = useStore(MyStore)

  const value = use(asyncValue)

  return 'Yeah, ' + value
}
```

::: tip

The signal will catch the error of the promise to set its new status, but will then reject the promise with the original reason. To **catch** an error you should either use async try/catch when assigning the promise to a signal, or use a `catch` on the promise after it has been assigned to the signal.

:::