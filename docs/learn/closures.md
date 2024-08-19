---
codeCaption: Stale closures
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

In the code example from the [previous chapter](./), the component only had one closure at any time. In the following code example, we are introducing an additional closure.

```tsx
import { useState, useCallback } from "react";

export default function App() {
  const [count, setCount] = useState(0);

  const increase = useCallback(() => {
    // Stale reference to "count"
    setCount(count + 1);
  }, []);

  return <button onClick={increase}>Increase ({count})</button>;
}
```

The `increase` function will still be re-created when the component reconciles, but the component will always reference the first instance because of `useCallback`. The great thing about this is that the reference to `increase` never changes and you can safely pass the function to a nested component and take advantage of `memo` to avoid unnecessary reconciliation. The problem is the mental overhead we introduce. It is very difficult to infer the number of closures a component operates with by reading the code. Bugs can also be difficult to resolve due to stale closures.

In the playground below, if you click the `increase` button multiple times, you will see the count only increases once. This happens because `useCallback` has closed over the initial `count`. You probably already know how to solve this, either by adding `count` to the dependency array or using an update callback with `setCount`. The point here though is that calling the component function multiple times makes sense in the mindset of comparing the returned result of the function to reconcile the UI, but it creates unwanted complexity with state management.

<ClientOnly>
 <Playground />
</ClientOnly>
