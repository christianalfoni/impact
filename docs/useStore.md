---
outline: deep
---

# useStore

The hook that allows you to consume your store in a component or from other stores.

```ts
import { useStore, store } from 'impact-react'

function MyStore() {
  const counter = store({
    count: 0
  })

  return counter
}

export const useMyStore = () => useStore(MyStore)
```

When a store is provided to the component tree it can consume other parent stores directly.

```ts
import { useStore, signal } from 'impact-react'
import { useGlobalStore } from '../globalStore'

function MyStore() {
  const globalStore = useGlobalStore()
  const counter = store({
    count: globalStore.initialCount
  })

  return counter
}

export const useMyStore = () => useStore(MyStore)
```

