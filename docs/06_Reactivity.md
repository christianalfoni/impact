# Reactivity

**Impact** uses the [SignalIt](https://github.com/christianalfoni/signalit) library to enable reactivity. In other words you define state as signals when you want components to be able to consume the state of your classes.

An example of this would be:

```ts
import { signal, Service } from 'impact-app'

@Service()
export class Counter {
    count = signal(0)
}
```

Given this service is exposed through a ServiceProvider, a component can now observe any changes by:

```tsx
import { useService, observe } from 'impact-app'
import { Counter } from '../services/Counter'

export function CounterComponent() {
  using _ = observe()
  
  const counter = useService(Counter)

  return (
    <div>
        <p>{counter.count.value}</p>
        <button onClick={() => counter.counter.value++}>Increase</button>
    </div>
  )
}
```

To adhere better to preferred object oriented patterns we could express the same as:

```ts
import { signal, Service } from 'impact-app'

@Service()
export class Counter {
    #count = signal(0)
    get count() {
        return this.#count.value
    }
    increaseCount() {
        this.#count.value++
    }
}
```

Now we have properly encapsulated the functionality of the Counter and only expose the possibility to consume and increase the count from a component:

```tsx
import { useService, observe } from 'impact-app'
import { Counter } from '../services/Counter'

export function CounterComponent() {
  using _ = observe()
  
  const counter = useService(Counter)

  // Notice we exposed the signal value as a getter and
  // can just use it directly now
  return (
    <div>
        <p>{counter.count}</p>
        <button onClick={() => counter.increaseCount()}>Increase</button>
    </div>
  )
}
```
