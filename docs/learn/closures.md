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

In the previous example code the component had only one closure at any time. In this code example we are introducing an additional closure. The `increase` function will be re-created when the component reconciles, but the component will always reference the first instance because of `useCallback`. The great thing about this is that the reference to `increase` never changes and you can safely pass the function to a nested component and take avantage of `memo` to avoid unnecessary reconciliation. The problem is the mental overhead we introduce. It is very difficult to infer the number of closures a component operates in by reading the code. It can also be difficult to resolve bugs due to stale closures.

<ClientOnly>
 <Playground />
</ClientOnly>

If you click the `increase` button multiple times you will see the count only increase once. This is because our `useCallback` has closed over the initial `count`. You probably already know how to solve this, either by adding `count` to the dependency array or using an update callback with `setCount`. The point here though is that calling the component function multiple times makes sense in the mindset of comparing the returned result of the function to reconcile the UI, but it creates unwanted complexity with state management.


