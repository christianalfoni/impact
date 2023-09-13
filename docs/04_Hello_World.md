# Hello World

```ts
import { signal, createHook } from 'impact-app'

function Timer() {
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

export const useTimer = createHook(Timer)
```

```tsx
import { observe } from 'impact-app'
import { useTimer } from './hooks/useTimer'

function App() {
    /*
      By default all hooks are global and can be used in any component
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
