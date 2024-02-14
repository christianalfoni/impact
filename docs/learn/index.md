---
layout: playground
code: |
    import { globalStore } from 'impact-react'

    const useStore = globalStore({
        count: 0,
        increase() {
            this.count++
        }
    })

    export default function App() {
        const store = useStore()

        return (
            <button onClick={store.increase}>
                Increase ({store.count})
            </button>
        )
    }
---

# The infamous counter

Exposing some state to React using **Impact** is straight forward. By using the [globalStore](../api#globalstore) you will have a counter shared by any component.

