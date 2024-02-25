---
codeCaption: Props in React
code: |
    import { useState } from 'react'

    function CountLabel({ count }) {
      return <span>Increase ({count})</span>
    }

    function Counter({ count, onClick }) {
      return (
        <button onClick={onClick}>
          <CountLabel count={count} />
        </button>
      )
    }

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

Another aspect of state management is how you get your state and management of that state to the UI that interacts with it. Where state and its management needs to be located in the component tree depends on where it needs to be consumed in the component tree. The further "away" the consuming components are, the higher up in the component tree the state managements needs to be defined and the farther it needs to "travel" through props to its consuming destination.

<ClientOnly>
  <Playground />
</ClientOnly>

This example is not complicated, but it shows two challenges that increases with the complexity of the application:

1. It becomes increasingly difficult to understand and navigate code as you need to "walk up" the component tree, which often is different files, to find the source of state and management of that state
2. It becomes increasingly difficult to make changes to the UI by moving components. The components does not only represent a UI tree, it is a state management tree as well

But you might say, this is what we have React contexts for! Let us move on and discuss that.
