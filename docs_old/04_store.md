# Store


## Description

The `store` is an abstraction over signals. It allows you to express state and derived state in a declarative manner with any methods, often called actions, for changing the state.

## Learn

### Creating a global store

As a convenience you can create a store using the `globalStore` factory function. It is a small abstraction over existing APIs:

```ts
import { globalStore, globalContext, store } from 'impact-app'

const myGlobalAppStore = globalStore({})

const sameAsAbove = globalContext(() => store({}))
```

The following documentation is the same for using `globalStore` or `store`.

### Creating a store

The `store` factory function is what creates stores. What makes the store reactive is that it is consumed through a context, that being implicit using `globalStore`, or explicit using `globalContext` or `context`.

```ts
import { store, context } from 'impact-app'

const useStore = context(() => store({
    count: 0,
    shouldDouble: false
}))
```

Now `count` and `shouldDouble` will be converted to individual signals. When accessing the store you can only read these signals, not change them. Only through an attached method can you change the value of a signal, change the state of the store.

When components access the store they will only reconcile based on the state they access. That means:

```tsx
import { useStore } from '.'

// I only reconcile when the `count` changes
function ComponentA() {
    const store = useStore()

    return <div>{store.count}</div>
}

// I only reconcile when `shouldDouble` changes
function ComponentB() {
    const store = useStore()

    return <div>{store.shouldDouble}</div>
}
```

### Deriving state

You can derive state in the store by using `getters`.

```ts
import { store, context } from 'impact-app'

const useStore = context(() => store({
    count: 0,
    shouldDouble: false,
    get maybeDoubled() {
        return this.shouldDouble ? this.count * 2 : this.count
    }
}))
```

The `maybeDoubled` getter will automatically observe any accessed signals and lazily flag itself as dirty when a dependent signal changes. When the getter is accessed again it will re-evaluate if flagged dirty.

### Changing state

To change the state of the store you can add a method.

```ts
import { store, context } from 'impact-app'

const useStore = context(() => store({
    count: 0,
    shouldDouble: false,
    get maybeDoubled() {
        return this.shouldDouble ? this.count * 2 : this.count
    },
    increase() {
        this.count++
    }
    toggleDouble() {
        this.shouldDouble = !this.shouldDouble
    }
}))
```

You can only change the state from these methods. You can also change the state asynchronously:

```ts
import { store, context } from 'impact-app'

const useStore = context(() => store({
    count: 0,
    increaseAsync() {
        setTimeout(() => {
            this.count++
        }, 1000)
    }
}))
```

