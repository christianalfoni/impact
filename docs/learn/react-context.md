---
layout: playground
code: |
    import { useState } from 'react'

    function CountLabel({ count }) {
        return <span>Increase ({count})</span>
    }

    function Counter({ count, onClick }) {
        return (
            <button onClick={increase}>
                <CountLabel count={count} />
            </button>
        )
    }

    export default function App() {
        const [count, setCount] = useState(0)

        const increase = () => {
            setCount(count + 1)
        }

        return <Counter count={count} onClick={increase} />
    }
prev: /props
next: /
---

# React Context

With a React context we can overcome both challenges we just experienced passing props. By providing a context we can consume state and related management in any nested component. This is great, but it will introduce a new set of challenges:

1. The provider component will also reconcile so we need to make sure that the value we expose on the context does not unnnecessarily change reference. We need to both use `useCallback` and `useMemo` to ensure that reconciliation from a parent causes the exposed value to **not** change reference, in turn making all consumers of the context reconcile
2. Regardless of the previous point you will have components unnecessarily reconciling due to the context value having to change reference whenever any of the state within changes reference. In other words React contexts is an "all or nothing" deal

All the challenges mentioned this far is the reason why we have global state stores like [Mobx](), [Redux]() and the likes. But let us now stay where we are and take the steps gradually back up to a global state store.