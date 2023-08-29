# Hello World

```ts
import { useSignal, createHook } from 'impact-app'

/*
  The hook runs once, which makes it an initialiser
*/
function Timer() {

  // Use signals to expose reactive state
  const count = useSignal(0)

  // Define private variables
  let interval: number
  let isRunning = true

  startInterval()

  // The "useDispose" hook runs when the related HooksProvider unmounts
  useDispose(stopInterval)
  
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

```ts
import { createHooksProvider } from 'impact-app'
import { useTimer } from './useTimer'

/*
  This provider scopes where the hooks will be instantiated and disposed. You can put it
  at any level in the component tree and expose any number of hooks
*/
export const HooksProvider = createHooksProvider({ useTimer })
```

```tsx
import { HooksProvider } from './hooks'
import { useTimer } from './hooks/useTimer'

function Timer() {
    /*
      Use the hook in any component nested in the provider. The "using" keyword
      is what enables reactivity.
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