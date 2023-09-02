# Hello World

```ts
import { signal, cleanup, createHook } from 'impact-app'

/*
  The hook runs once
*/
function Timer() {

  // Use signals to expose reactive state
  const count = signal(0)

  // The hook runs once, so you can initialize variables
  let interval: number
  let isRunning = false

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

  // Return an object representing state and methods 
  return {
    // Expose signals with getters
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
import { useTimer } from './hooks/useTimer'

function Timer() {
    /*
      By default all hooks are global and can be used in any component. The "using" keyword is what enables reactivity.
    */
    using timer = useTimer()
    
    return (
      <div>
        <h1>{timer.count}</h1>
        <button onClick={() => timer.start()}>Start</button>
        <button onClick={() => timer.stop()}>Stop</button>
      </div>
    )
}

export function App() {
  return (
    <HooksProvider>
      <Timer />
    </HooksProvider>
  )
}
```