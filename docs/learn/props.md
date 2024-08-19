---
codeCaption: Props in React
code: |
  import { useState } from 'react'

  // "CountLabel.tsx"
  function CountLabel({ count }) {
    return <span>Increase ({count})</span>
  }

  // "Counter.tsx"
  function Counter({ count, onClick }) {
    return (
      <button onClick={onClick}>
        <CountLabel count={count} />
      </button>
    )
  }

  // "App.tsx"
  export default function App() {
    const [count, setCount] = useState(0)

    const increase = () => {
      setCount(count + 1)
    }

    return (
      <Counter
        count={count}
        onClick={increase}
      />
    )
  }
---

# Props

Another aspect of state management is how you get your state and the management of that state to the UI that interacts with it.

Where state management needs to be located in the component tree depends on where it needs to be consumed in the component tree. The farther "away from each other" the consuming components are, the higher up in the component tree the state management needs to be defined and the farther it needs to "travel" through props to its consuming destination.

The example shown in the playground below is not complicated, but it shows two challenges with props that increase with the complexity of the application:

1. It becomes increasingly difficult to understand and navigate code as you need to "walk up" the component tree (which often consists of different files) to find the source of state and management of that state.
2. It becomes increasingly difficult to make changes to the UI by moving components. The components represent not only a UI tree but also a state management tree.

<ClientOnly>
  <Playground />
</ClientOnly>
