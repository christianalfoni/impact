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

    function Example() {
        const { count, increase } = useApp()

        return (
            <button onClick={increase}>
                Increase ({count})
            </button>
        )
    }

    export default function App() {
        return (
            <useApp.Provider>
                <Example />
            </useApp.Provider>
        )
    }
prev: /impact-context
next: /effects
---

# Signals

A signal is the equivalent of `useState`, only reactive. You access the current value using `.value` property and you update the value by assigning to it. When a component accesses the `.value` of a signal during its rendering, it will automatically observe any changes to that value.

As the example shows it is common to expose signals using `getters`, meaning that accessing `.value` becomes implicit when consuming a signal from a component. 

Just like `useState` the value of a signal is considered immutable and needs to *strictly* change the `.value` to trigger observation.

But signals in **Impact** has one more capability. They have first class support for promises. That means any promise assigned to a signal can be observed. You can even use the new [use]() hook to suspend these promises. You will learn more about this in a later chapter.