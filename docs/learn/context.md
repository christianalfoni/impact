---
codeCaption: React context
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
      setCount((current) => current + 1)
    }, [])

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

1. The provider component will reconcile unrelated to actual changes within the context, so we need to make sure that the value we expose on the context does not unnnecessarily change reference. We need to use both `useCallback` and `useMemo` to ensure that reconciliation prevents the exposed value to change reference unnecessarily, or all components consuming the context reconciles as well
2. When the context value change reference, all consumers of the context reconciles. That means React contexts is an "all or nothing" deal. Components consuming the context reconciles on any change in the context, not by the state they actually consume
3. The reconciliation loop is designed for reconciling the UI, it is not designed for effficient state management. Having multiple and possibly stale closures, inability to detect mount/unmount etc. makes the reconciliation loop a challenging runtime for state management

::: info

Even though the new [React Compiler](https://react.dev/blog/2024/02/15/react-labs-what-we-have-been-working-on-february-2024#react-compiler) can solve the first point, it will not solve the other points

:::

<ClientOnly>
 <Playground />
</ClientOnly>


All the challenges mentioned this far is the reason why we have global state stores like [Redux](https://redux.js.org/), [Mobx](https://mobx.js.org/README.html) and the likes. Let us explore how Impact solves these challenges without limiting you to a global scope.