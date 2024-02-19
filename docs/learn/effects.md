---
layout: playground
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

        return <Counter count={count} onClick={increase} />
    }
prev: /derived
next: /react-context
---

# Effects
