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

<ClientOnly>
 <Playground />
</ClientOnly>

With a React context we can overcome both challenges we just experienced passing props. By providing a context we can consume state and related management in any nested component. This is great, but it will introduce a new set of challenges:

1. The context provider will reconcile unrelated to actual changes on the context. We need to use memoizing hooks to ensure that reconciliation of the context provider does not change reference of the context unnecessarily, or all components consuming the context reconciles as well
2. When the context actually changes reference, due to a state change, all consumers of the context will reconcile. That means React contexts is an "all or nothing" deal. Components consuming the context reconciles on any change of the context, not by the state they actually consume from it
3. The component as a function is an amazing concept. It makes a lot of sense to think of UIs as `(state) => ui`. Calling the function with updated state will update the UI. This is what Reacts reconciler enable. When hooks was introduced the reconciler could also manage state within the function itself, allowing us to fully embrace the function component. Hooks is the most elegant way to introduce state management with a reconciler, but a reconciler is not something you would introduce to make state management more performant or accessible in and of itself. As context is typically used for state management there are really no benefits to using a reconciler. There are other concepts, like reactivity, that is more suited for state management

Even though the new [React Compiler](https://react.dev/blog/2024/02/15/react-labs-what-we-have-been-working-on-february-2024#react-compiler) can solve the first point, it will not solve the other points
