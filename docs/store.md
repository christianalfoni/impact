---
outline: deep
---

# store

An abstraction over [signal](./signal.md) that allows you to consume state and related logic as an object. Each key in the store object is converted to a signal/derived. The store object can be returned from the store scope as a `readonly` entity for consumers.

```ts
import { store } from 'impact-react'

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

  return counter.readonly()
}
```
