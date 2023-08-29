# Reactivity

**Impact** implements signals to enable reactivity. In other words you define state as signals when you want components to be able to consume the state of your services.

An example of this would be:

```ts
import { createHook, useSignal } from 'impact-app'

function Counter() {
  const count = useSignal(0)

  return {
    get count() {
      return count.value
    },
    increaseCount() {
      count.value++
    }
  }
}

export const useCounter = createHook(Counter)
```

A component can now observe any changes by:

```tsx
import { observe } from 'impact-app'
import { useCounter } from '../hooks/useCounter'

export function CounterComponent() {
  using counter = useCounter()

  // Notice we exposed the signal value as a getter and
  // can just use it directly now
  return (
    <div>
        <p>{counter.count}</p>
        <button onClick={() => counter.increaseCount()}>Increase</button>
    </div>
  )
}
```
