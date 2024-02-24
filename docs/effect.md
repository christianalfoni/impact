---
outline: deep
---

# Effect

Reactive effect. Will oberve and signals or derived in its callback. It runs immediately and will run again whenever obervation triggers. If an effect both observes and sets the same signal, the observation is ignored.

```ts
import { effect, signal } from 'impact-react'

function MyStore() {
  const count = signal(0)

  effect(() => {
    console.log(count.value)
  })

  return {
    get count() {
      return count.value
    }
  }
}
```
