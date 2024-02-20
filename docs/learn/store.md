---
code: |
    import { store } from 'impact-react'

    const useStore = store({
        count: 0,
        increase() {
            this.count++
        }
    })

    export default function App() {
        const { count, increase } = useStore()

        return (
            <button onClick={increase}>
                Increase ({count})
            </button>
        )
    }
prev: /props
next: /composeable-store
---

# Store

Moving back to our initial example we implement a `store` with the same `count` and `increase`. What has changed now is that our store is global and can be used by any component.

Each key in the store is a [signal](../api#signal), where `getters` are [dervied](../api/#derived). Any methods defined in the store has access to change the any of the signals in the store, though they are `readonly` from components.

Creating declarative global stores like this can work for certain apps, but **Impact** is designed to handle more complexity.

<Playground />