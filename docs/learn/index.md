---
codeCaption: Reconciliation in React
code: |
  import { useState } from 'react'

  export default function App() {
    const [count, setCount] = useState(0)

    const increase = () => {
      setCount(count + 1)
    }

    return (
      <button onClick={increase}>
        Increase ({count})
      </button>
    )
  }
---

# Introduction

Before learning about **Impact**, we have to understand the problem it solves. To do so, we are going to spend the first chapters looking at what state management in React looks like and why it has its shortcomings.

We start our journey with a `count` and the ability to `increase` that count. This example shows what React fundamentally does: you can create component functions that return a declarative description of its UI.

```tsx
import { useState } from "react";

export default function App() {
  const [count, setCount] = useState(0);

  const increase = () => {
    setCount(count + 1);
  };

  return <button onClick={increase}>Increase ({count})</button>;
}
```

When the component state changes, React calls the component function again, and the newly returned UI description is compared with the previous one. This is called [reconciliation](https://legacy.reactjs.org/docs/reconciliation.html)—a fantastic feature of React. Because of it, you can use standard JavaScript syntax to create conditions, loops, switches, etc., to describe your UI.

<ClientOnly>
 <Playground />
</ClientOnly>
