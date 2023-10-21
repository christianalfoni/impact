# Hello World

This example is a *silly* example, but it shows:

- Stores are just functions that run once
- You can define variables
- You can safely run a side effect when the store initialises
- You can define reactive state to be consumed by components and other stores
- You can dispose when the store unmounts
- You can use getters to consume signals as readonly state

```ts
import { signal, store, cleanup } from 'impact-app'

export function CounterStore() {
  // The store body runs once, so you can define variables as private state
  let counterInterval
  
  // Use signals to expose reactive state
  const count = signal(0)

  // When the scope this store is exposed through unmounts, it will stop the interval
  cleanup(stopCounter)

  function startCounter() {
    counterInterval = setInterval(() => count.value++, 1000)
  }

  function stopCounter() {
    clearInterval(counterInterval)
  }

  return {
    get count() {
      return count.value
    },
    start() {
      stopCounter()
      startCounter()
    },
    stop() {
      stopCounter()
    }
  }
}

export const useCounter = () => store(CounterStore)
```

```tsx
import { observer } from 'impact-app'
import { useCounter } from '../stores/CounterStore'

function App() {
    /*
      By default all stores are global and can be used in any component
    */
    const { count, start, stop } = useCounter()
    
    return (
      <div>
        <h1>{count}</h1>
        <button onClick={() => start()}>Start</button>
        <button onClick={() => stop()}>Stop</button>
      </div>
    )
}

/*
  To enable reactivity the component needs to be observed.
  NOTE! You can alternatively use "observer" with the "using"
  keyword to avoid wrapping components this way
*/
export default observer(App)
```
