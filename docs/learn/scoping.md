---
code: |
    import { store, signal, cleanup } from 'impact-react'

    const useStore = store(({ initialCount }) => {
        const count = signal(initialCount)
        const interval = setInterval(() => {
            count.value++
        }, 1000)

        cleanup(() => clearInterval(interval))

        return {
            get count() {
                return count.value
            }
        }
    })

    function Counter() {
        const { count } = useStore()

        return (
            <h2>
                Count {count}
            </h2>
        )
    }

    export default function App() {
        return (
            <useStore.Provider initialCount={10}>
                <Counter />
            </useStore.Provider>
        )
    }
---

# Scoping

By default the stores are global, but you can scope them to specific component trees as well by using their provider.

The hook used with the store has a `.Provider` property on it. Under the hood the store is exposed through a React context. The store is instantiated when the provider mounts and the `cleanup` is called when the provider unmounts.

Scoping stores allows you to instantiate state management related to specific pages, features or even for each item in a list.

Additionally the store can now receive props from the provider to initialise itself. This is especially useful to take advantage of modern React data fetching patterns, as you will see later.

<Playground />