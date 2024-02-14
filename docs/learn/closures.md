---
layout: playground
code: |
    import { useState, useCallback } from 'react'

    export default function App() {
        const [count, setCount] = useState(0)

        const increase = useCallback(() => {
            setCount(count + 1)
        }, [])

        return (
            <button onClick={increase}>
                Increase ({count})
            </button>
        )
    }
prev: /
next: /signals
---

# Closures

Whenever you change state in a component it needs to reconcile. In practice the component function is run again and as a result you can have multiple function closures active at any time. In the previous version of the component there was only one active closure active at any time, cause there is only one function... the component.

In this example though we have introduced another scope, the `increase` function will not be re-created when the component reconciles because of `useCallback`. The great thing about this is that the reference to `increase` never changes and you can safely pass the function to nested component and take avantage of `memo` where needed, to avoid unnecessary reconciliation. The problem though is that the component now operates with two closures at any time. The reconciliation closure of the component, and the `useCallback` close which is created on the first render of the component.

