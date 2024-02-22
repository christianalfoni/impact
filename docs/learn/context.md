---
code: |
  import { useState, createContext, useContext, useCallback, useMemo } from 'react'

  const appContext = createContext()

  function CountLabel() {
    const { count } = useContext(appContext)

    return <span>Increase ({count})</span>
  }

  function Counter() {
    const { increase } = useContext(appContext)

    return (
      <button onClick={increase}>
        <CountLabel />
      </button>
    )
  }

  export default function App() {
    const [count, setCount] = useState(0)

    const increase = useCallback(() => {
      setCount(count + 1)
    }, [count])

    const app = useMemo(() => ({
      count,
      increase
    }), [count, increase])

    return (
      <appContext.Provider value={app}>
        <Counter />
      </appContext.Provider>
    )
  }
---

# Context

With a React context we can overcome both challenges we just experienced passing props. By providing a context we can consume state and related management in any nested component. This is great, but it will introduce a new set of challenges:

1. The provider component will also reconcile so we need to make sure that the value we expose on the context does not unnnecessarily change reference. We need to use both `useCallback` and `useMemo` to ensure that reconciliation from a parent causes the exposed value to **not** change reference, in turn making all consumers of the context reconcile
2. Regardless of the previous point you will have components unnecessarily reconciling due to the context value having to change reference whenever any of the state in the context changes. In other words React contexts is an "all or nothing" deal
3. Even with Reacts compiler, you will still have performance issues as any state changed within the context will cause any consumer of the text to reconcile, even though they where not concerned with that specific state change
4. You can not reliably instantiate and dispose objects related to mounting and unmounting the context/component


<ClientOnly>
 <Playground />
</ClientOnly>

::: tip
All the challenges mentioned this far is the reason why we have global state stores like [Redux](https://redux.js.org/), [Mobx](https://mobx.js.org/README.html) and the likes. These are all great solutions, but let us explore how Impact solves these challenges and how it differs from the others.
:::