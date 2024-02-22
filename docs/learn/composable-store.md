---
codeCaption: Creating a composable Store
code: |
    import { store, signal } from 'impact-react'

    const useStore = store(() => {
        const timer = signal(0)

        let interval

        return {
            get timer() {
                return timer.value
            },
            start() {
                interval = setInterval(() => {
                    timer.value++
                }, 1000)
            },
            stop() {
                clearInterval(interval)
            },
            reset() {
                clearInterval(interval)
                timer.value = 0
            }
        }
    })

    export default function App() {
        const { timer, start, stop, reset } = useStore()

        return (
            <div>
                <h4>{timer}s</h4>
                <button onClick={start}>
                    Start
                </button>
                <button onClick={stop}>
                    Stop
                </button>
                <button onClick={reset}>
                    Reset
                </button>
            </div>
        )
    }
---

# Composable Store

If you rather pass a function to the `store` you will gain more power. In the scope of this function you are free to instantiate classes, assign local variables, start subscriptions, pretty much whatever you want. What you return from this function will be exposed from the store.

::: info
What you will mainly use this function for though is implementing state management using the reactive primitives from **Impact**.
:::

<ClientOnly>
  <Playground />
</ClientOnly>