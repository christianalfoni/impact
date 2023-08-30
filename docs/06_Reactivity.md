# Reactivity

**Impact** implements signals to enable reactivity. In other words you define state as signals when you want components to be able to consume the state of your services.

An example of this would be:

```ts
import { createHook, signal } from 'impact-app'

function Counter() {
  const count = signal(0)

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

A component can now observe any changes by simply using the `using` keyword:

```tsx
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

## Complex values

Signal values are considered immutable, meaning you always have to assign a new value to the signal. That means normally you would have to:

```ts
const post = signal({ title: 'foo' })

post.value = { title: 'foo2' }
```

But **Impact** ships with [Immer](https://immerjs.github.io/immer/) under the hood which means you can rather set the value using a function:

```ts
const post = signal({ title: 'foo' })

post.value = (draft) => {
  draft.title = 'foo2'
} 
```

This function assignment runs Immer and produces an immutable result.

You can use the version you prefer and it is all typed and ready for you.