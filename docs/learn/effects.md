---
code: |
    import { store, signal, effect } from 'impact-react'

    const useStore = store(() => {
        const count = signal(0)

        effect(() => console.log(count.value))

        return {
            get count() {
                return count.value
            },
            increase() {
                count.value++
            }
        }
    })

    function Counter() {
        const { count, increase } = useStore()

        return (
            <button onClick={increase}>
                Increase ({count})
            </button>
        )
    }

    export default function App() {
        return <Counter />
    }
prev: /derived
next: /react-context
---

# Effects

**Impact** effects allows you to run logic related to signal changes observed in the effect. 

<Playground />