---
layout: playground
code: |
    import { context, signal } from 'impact-react'

    const useApp = context(() => {
        const count = signal(0)
        const enabled = signal(false)

        return {
            get count() {
                return count.value
            },
            get enabled() {
                return enabled.value
            },
            increase() {
                count.value++
            },
            toggleEnabled() {
                enabled.value = !enabled.value
            }
        }
    })

    function Counter() {
        const { count, increase } = useApp()

        return (
            <button onClick={increase}>
                Increase ({count})
            </button>
        )
    }

    function Enabler() {
        const { enabled, toggleEnabled } = useApp()

        return (
            <button onClick={toggleEnabled}>
                {enabled ? "Disable" : "Enable"}
            </button>
        )
    }

    export default function App() {
        return (
            <useApp.Provider>
                <Counter />
                <Enabler />
            </useApp.Provider>
        )
    }
prev: /impact-context
next: /derived
---

# Signals

A signal is the equivalent of `useState`, only reactive. You access the current value using `.value` property and you update the value by assigning to it. When a component accesses the `.value` of a signal during its rendering, it will automatically observe any changes to that value. And this is where signals have an advantage. It does not matter how many signals are exposed through the context, only the ones actually accessed will cause the component to reconcile when changed.

As the example shows it is common to expose signals using `getters`, meaning that accessing `.value` becomes implicit when consuming a signal from a component. 

Just like `useState` the value of a signal is considered immutable and needs to *strictly* change the `.value` to trigger observation.

But signals in **Impact** has one more capability. They have first class support for promises. That means any promise assigned to a signal can be observed. You can even use the new [use]() hook to suspend these promises. You will learn more about this in a later chapter.