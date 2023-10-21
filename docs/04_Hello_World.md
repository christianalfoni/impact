# Hello World

This example is a *silly* example, but it shows:

- Stores are just functions that run once
- You can define variables
- You can safely run a side effect when the store initialises
- You can define reactive state to be consumed by components and other stores
- You can dispose when the store unmounts
- You can use getters to consume signals as readonly state

```ts
import { signal, useCleanup, useStore } from 'impact-app'

export function TimerStore() {
  // This function runs once, so you can initialize variables
  let interval: number
  let isRunning = false

  // Use signals to expose reactive state
  const count = signal(0)

  // When the scope this store is exposed through unmounts, it will stop the interval
  useCleanup(stopInterval)

  // You can also safely start side effects
  startInterval()

  function startInterval() {
    interval = setInterval(() => count.value++, 1000)
    isRunning = true
  }

  function stopInterval() {
    clearInterval(interval)
    isRunning = false
  }

  return {
    get count() {
      return count.value
    },
    start() {
      if (!isRunning) {
        startInterval()
      }
    },
    stop() {
      if (isRunning) {
        stopInterval()
      }
    }
  }
}

export const useTimer = () => useStore(TimerStore)
```

```tsx
import { observe, useStore } from 'impact-app'
import { useTimer } from './stores/TimerStore'

function App() {
    /*
      By default all stores are global and can be used in any component
    */
    const timer = useTimer()
    
    return (
      <div>
        <h1>{timer.count}</h1>
        <button onClick={() => timer.start()}>Start</button>
        <button onClick={() => timer.stop()}>Stop</button>
      </div>
    )
}

/*
  To enable reactivity the component needs to be observed.
  NOTE! You can alternatively use "observe" with the "using"
  keyword to avoid wrapping components this way
*/
export default observe(App)
```
