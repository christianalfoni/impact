# Hello World

```ts
import { signal, context, cleanup } from 'impact-app'

function CounterContext() {
  // The store body runs once, so you can define variables as private state
  let counterInterval
  
  // Use signals to expose reactive state
  const count = signal(0)

  // When the provider for this context unmounts, it will stop the interval
  cleanup(stopCounter)

  function startCounter() {
    counterInterval = setInterval(() => count.value++, 1000)
  }

  function stopCounter() {
    clearInterval(counterInterval)
  }

  return {
    // Using a getter makes the state "readonly", only allow you to change it from within the context and
    // still tracks access to the value for observability
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

export const useCounterContext = context(CounterContext)
```

```tsx
import { observer } from 'impact-app'
import { useCounterContext } from './useCounterContext'

const Counter = observer(() => {
    const { count, start, stop } = useCounterContext()
    
    return (
      <div>
        <h1>{count}</h1>
        <button onClick={() => start()}>Start</button>
        <button onClick={() => stop()}>Stop</button>
      </div>
    )
})

export default function App() {
  return (
    <useCounterContext.Provider>
      <Counter />
    </useCounterContext.Provider>
  )
}
```
