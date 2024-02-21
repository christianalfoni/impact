---
outline: deep
---

# Store

## store (declarative)

A simple declarative store.

```ts
import { store } from 'impact-react'

const useStore = store({
    count: 0,
    increase() {
        this.count++
    },
    get doubleCount() {
        return this.count * 2
    }
})
```

## store (composable)

A composable store allowing for composition with other stores, a private scope, effects and cleanup.

```ts
import { store, signal, derived, effect } from 'impact-react'

const useStore = store(() => {
    const count = signal()
    const doubleCount = derived(() => count.value * 2)

    effect(() => console.log(count.value))

    return {
        get count() {
            return count.value
        },
        get doubleCount() {
            return doubleCount.value
        },
        increase() {
            count.value++
        }
    }
})
```

## store.Provider

A store can be scoped to a component tree. This allows for passing props to the store.

```tsx
import { store, signal } from 'impact-react'

const useStore = store(({ initialCount }) => {
    const count = signal(initialCount)

    return {
        get count() {
            return count.value
        },
        increase() {
            count.value++
        }
    }
})

function Counter() {
    const { count, increase } = useStore()

    return (
        <button onClick={increase}>
            Increase ({count})
        </button>
    )
}

function App() {
    return (
        <useStore.Provider initialCount={10}>
            <Counter />
        </useStore.Provider>
    )
}
```

## store.provide

Provide the store using a higher order component.

```tsx
import { store, signal } from 'impact-react'

const useStore = store(({ initialCount }) => {
    const count = signal(initialCount)

    return {
        get count() {
            return count.value
        },
        increase() {
            count.value++
        }
    }
})

const Counter = useStore.provide(function Counter() {
    const { count, increase } = useStore()

    return (
        <button onClick={increase}>
            Increase ({count})
        </button>
    )
})

function App() {
    return <Counter initialCount={10} />
}
```
