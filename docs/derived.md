---
outline: deep
---

# Derived

Derived reactive state. Will observe any signals or other derived in its callback. It lazily evaluates, which means when obseration triggers it only flags itself as dirty. The derived needs to be accessed to recaulcate its value.

```ts
import { store, signal, derived } from 'impact-react'

const useStore = store(() => {
    const count = signal(0)
    const doubleCount = derived(() => count * 2)

    return {
        get counter() {
            return count.value
        },
        get doubleCount() {
            return doubleCount.value
        }
    }
})
```
