---
code: |
    import { store, signal } from 'impact-react'

    const useStore = store(() => {
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
        const { count, increase } = useStore()

        return (
            <button onClick={increase}>
                Increase ({count})
            </button>
        )
    }

    function Enabler() {
        const { enabled, toggleEnabled } = useStore()

        return (
            <button onClick={toggleEnabled}>
                {enabled ? "Disable" : "Enable"}
            </button>
        )
    }

    export default function App() {
        return <>
            <Counter />
            <Enabler />
        </>
    }
---

# Signals

The `signal` is the primitive you use to define state. When a component accesses the `.value` of a signal during its rendering, it will automatically observe any changes to that value. It does not matter how many signals are exposed through the store, only the ones actually accessed in a component will cause that component to reconcile.

As the example shows it is common to expose signals using `getters`, meaning that accessing `.value` becomes implicit when consuming a signal from a component. 

Just like `useState` the value of a signal is considered immutable and needs to *strictly* change the `.value` to trigger observation.

But signals in **Impact** has one more capability. They have first class support for promises. That means any promise assigned to a signal can be observed. You can even use the new [use]() hook to suspend these promises. You will learn more about this in a later chapter.

<ClientOnly>
  <Playground />
</ClientOnly>