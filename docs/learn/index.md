---
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

# State management

In this tutorial we will discuss and learn about state management in React. Why do we even need more primitives than what React offers? What do we mean by **reactive**? And why is reactive state management any better than traditional React state management?

We start our journey with a `count` and the ability to `increase` that count. Let us first explore why state management in React has its challenges and then we'll continue learning how **Impact** resolves these challenges.

<ClientOnly>
 <Playground />
</ClientOnly>