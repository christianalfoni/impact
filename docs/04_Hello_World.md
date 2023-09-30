# Hello World

```ts
import { signal } from 'impact-app'

export function TimerStore() {
  // This function runs once, so you can initialize variables
  let interval: number
  let isRunning = false

  // Use signals to expose reactive state
  const count = signal(0)

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
```

```tsx
import { observe, useStore } from 'impact-app'
import { TimerStore } from './stores/TimerStore'

function App() {
    /*
      By default all stores are global and can be used in any component
    */
    const timerStore = useStore(TimerStore)
    
    return (
      <div>
        <h1>{timerStore.count}</h1>
        <button onClick={() => timerStore.start()}>Start</button>
        <button onClick={() => timerStore.stop()}>Stop</button>
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
