---
layout: playground
code: |
    import { context, signal } from 'impact-react'

    const useApp = context(() => {
        const count = signal(0)

        return {
            get count() {
                return count.value
            },
            increase() {
                count.value++
            }
        }
    })

    function CountLabel() {
        const { count } = useApp()

        return <span>Increase ({count})</span>
    }

    function Counter() {
        const { increase } = useApp()

        return (
            <button onClick={increase}>
                <CountLabel />
            </button>
        )
    }

    export default function App() {
        return (
            <useApp.Provider>
                <Counter />
            </useApp.Provider>
        )
    }
prev: /props
next: /signals
---

# Context

**Impact** also has a context, though it is reactive. Instead of implementing the context value in a component, we use a callback. Since the context is reactive the context callback only runs once during its lifetime.

The count is exposed using a signal, which any component consuming the context can observe. This context can be populated with as many signals as you need, only the ones actually accessed in any component will cause that component to reconcile when changed.

Not having to think of reconciliation when implementing state management is a relief. Also you can not get into performance issues due to the size of your context.

This is using the core primitives of **Impact** and as you can see they are direct replacements of the core primitives of React itself. As you will see later **Impact** does provide higher abstractions over these primitives, but it is important to learn how flexible **Impact** is at its core before we dive into those higher abstractions.
