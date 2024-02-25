---
outline: deep
---

# useStore

The hook the allows you to consume your store in a component or from other stores.

```ts
import { useStore, signal } from 'impact-react'

function MyStore() {
  const count = signal()

  return {
    get count() {
      return count.value
    }
  }
}

export const useMyStore = () => useStore(MyStore)
```

When a store is provided to the component tree it can consume other parent stores directly.

```ts
import { useStore, signal } from 'impact-react'
import { useGlobalStore } from '../globalStore'

function MyStore() {
  const globalStore = useGlobalStore()
  const count = signal(globalStore.initialCount)

  return {
    get count() {
      return count.value
    }
  }
}

export const useMyStore = () => useStore(MyStore)
```

