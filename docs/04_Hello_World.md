# Hello World

```ts
import { signal, context, cleanup } from 'impact-app'

export const useCounter = context(() => {
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
})
```

```tsx
import { observer } from 'impact-app'
import { useCounter } from '../stores/CounterStore'

const Counter = observer(() => {
    const { count, start, stop } = useCounter()
    
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
    <useCounter.Provider>
      <Counter />
    </useCounter.Provider>
  )
}
```
