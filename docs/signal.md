---
outline: deep
---

# Signal

Reactive state. The value is considered immutable and needs to be replaced. If replaced with the same value, the signal will not trigger.

```ts
import { store, signal } from 'impact-react'

const useStore = store(() => {
  const count = signal(0)

  return {
    get counter() {
      return count.value
    }
  }
})
```
