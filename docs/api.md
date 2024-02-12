---
outline: deep
---

# API

## globalStore

```tsx
import { globalStore } from 'impact-react'

const useStore = globalStore({
    count: 0
})

export function App() {
  const store = useStore()

  return <div>{store.count}</div>
}
```

## globalContext

## store

## signal

## derived

## effect

## context

## More

Check out the documentation for the [full list of runtime APIs](https://vitepress.dev/reference/runtime-api#usedata).
