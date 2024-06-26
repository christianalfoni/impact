---
outline: deep
---

# createStoreProvider

A store can be scoped to a component tree. This allows you to pass props to the store and [cleanup](./cleanup.md) when the related component tree unmounts.

```tsx
import { store, signal, createStoreProvider } from 'impact-react'

function MyStore({ initialCount }) {
  const count = signal(initialCount)

  return {
    get count() {
      return count.value
    },
    increase() {
      count.value++
    }
  }
}

const MyStoreProvider = createStoreProvider(MyStore)

function Counter() {
  using myStore = useStore(MyStore)
  const { count, increase } = myStore

  return (
    <button onClick={increase}>
      Increase ({count})
    </button>
  )
}

function App() {
  return (
    <MyStoreProvider initialCount={10}>
      <Counter />
    </MyStoreProvider>
  )
}
```

Alternatively, use the higher order component:

```tsx
const App = MyStoreProvider.provide(function App() {
  using myStore = useStore(MyStore)
  const { count, increase } = myStore

  return (
    <button onClick={increase}>
      Increase ({count})
    </button>
  )
})
```

