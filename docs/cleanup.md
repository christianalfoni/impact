---
outline: deep
---

# cleanup

When stores are scoped to component trees, you can use `cleanup` to dispose of any subscriptions, class instances, etc., when the related provider unmounts from the component tree.

```ts
import { useStore, signal, createStoreProvider } from 'impact-react'

function MyStore() {
  const count = signal()

  const interval = setInterval(() => {
    count.value++
  }, 500)

  cleanup(() => clearInterval(interval))

  return {
    get count() {
      return count.value
    }
  }
}

export const useMyStore = () => useStore(MyStore)
export const MyStoreProvider = createStoreProvider(MyStore)
```
