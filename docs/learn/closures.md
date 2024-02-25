---
codeCaption: Understanding closures in React
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
---

# Closures

Whenever you change state in a component it needs to call the component function again, it needs to reconcile. In the previous example code the component had only one active closure at any time, cause there is only one function... the component. Reconciliation is a fantastic feature of React. Because of this you can just use normal JavaScript syntax to create conditions, loops, switches etc. to describe your UI.

In this code example we have introduced another scope. The `increase` function will be re-created when the component reconciles, but the component will always reference the first instance because of `useCallback`. The great thing about this is that the reference to `increase` never changes and you can safely pass the function to a nested component and take avantage of `memo` where needed to avoid unnecessary reconciliation. The problem though is that the component now operates with two closures at any time. The reconciliation closure of the component, and the `useCallback` closure which is created on the first render of the component.

<ClientOnly>
 <Playground />
</ClientOnly>

If you click the `increase` button multiple times you will see the count only increase once. This is because our `useCallback` has closed over the initial `count`. You probably already know how to solve this, either by adding `count` to the dependency array or using an update callback with `setCount`. The point here though is that calling the component function multiple times makes sense in the mindset of comparing the returned result of the function to reconcile the UI, but it creates unwanted complexity with state management.


