---
codeCaption: The infamous counter
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

Before we learn about **Impact** we have to learn about what problem **Impact** solves. To do so we are going to spend the first chapters looking at what state management in React looks like and why it has its shortcomings.

We start our journey with a `count` and the ability to `increase` that count. This example shows what React fundamentally does. You can create component functions that returns a declarative description of its UI. When the component state changes, the component function is called again by React and the newly returned UI description is compared with the previous. This is called [reconciliation](https://legacy.reactjs.org/docs/reconciliation.html). Reconciliation is a fantastic feature of React. Because of this you can just use normal JavaScript syntax to create conditions, loops, switches etc. to describe your UI.

<ClientOnly>
 <Playground />
</ClientOnly>