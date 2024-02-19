---
layout: playground
code: |
    import { context, signal, derived } from 'impact-react'

    const useApp = context(() => {
        const count = signal(0)
        const enabled = signal(false)
        const multipliedCount = derived(() => enabled.value ? count.value * 4 : count.value * 2 )

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
            },
            get multipliedCount() {
                return multipliedCount.value
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

    function Multiplier() {
        const { multipliedCount } = useApp()

        return <h2>Multiplied: {multipliedCount}</h2>
    }

    export default function App() {
        return (
            <useApp.Provider>
                <Counter />
                <Enabler />
                <Multiplier />
            </useApp.Provider>
        )
    }
prev: /signals
next: /effects
---

# Derived

Derived signals are equivalents of `useMemo`. They will calculate a value based on other signals and cache it. The benefit `derived` has over `useMemo` is that they do not immediately recaculcate when a dependent signal changes, but rather flag itself as dirty. Only when the value is accessed it will recompute the value.

Derived is consumed just like a plain signal, using the `.value` property, but you can not assing a value to a derived.
