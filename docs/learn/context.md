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

1. The provider component will reconcile so we need to make sure that the value we expose on the context does not unnnecessarily change reference. We need to use both `useCallback` and `useMemo` to ensure that reconciliation from a parent causes the exposed value to **not** change reference, or all consumers of the context reconciles as well
2. When the context value does change reference, all consumers of the context reconciles. That means React contexts is an "all or nothing" deal. Components consuming the context reconciles on any change in the context, not by the state they actually consume

<ClientOnly>
 <Playground />
</ClientOnly>


All the challenges mentioned this far is the reason why we have global state stores like [Redux](https://redux.js.org/), [Mobx](https://mobx.js.org/README.html) and the likes. These are all great solutions, but let us explore how Impact solves these challenges and how it differs from the others.
