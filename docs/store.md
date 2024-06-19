---
outline: deep
---

# store

An abstraction over [signal](./signal.md) that allows you to consume state and related logic as an object. Each key in the store object is converted to a signal/derived. It is recommended that you return your store using the `readonlyStore` utility. This gives additional safety as you can not change the store from components.

```ts
import { store, readonlyStore } from 'impact-react'

function MyStore() {
  const counter = store({
    count: 0,
    get double() {
        return counter.count * 2
    },
    increase() {
        counter.count++
    }
  })

  return readonlyStore(counter)
}
```

:::tip
With TypeScript, it is recommended that you type your variable rather than the generic. This ensures that using getters does not cause an indirect reference error.

```ts
import { store, readonlyStore } from 'impact-react'

type MyStore = {
  count: number
  double: number
  increase(): void
}

function MyStore() {
  const counter: MyStore = store({
    count: 0,
    get double() {
        return counter.count * 2
    },
    increase() {
        counter.count++
    }
  })

  return readonlyStore(counter)
}
```
:::