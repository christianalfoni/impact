# Reactivity

**Impact** implements signals to enable reactivity. In other words you define state as signals when you want components to be able to consume the state of your services.

An example of this would be:

```ts
import { Signal, Service, Disposable, useService } from 'impact-app'

@Service()
export class Counter extends Disposable {
    @Signal()
    count = 0
}

export const useCounter = () => useService(Counter)
```

Given this class is exposed through a `ServiceProvider` component, a component can now observe any changes by:

```tsx
import { observe } from 'impact-app'
import { useCounter } from '../services/Counter'

export function CounterComponent() {
  using _ = observe()
  
  const counter = useCounter()

  return (
    <div>
        <p>{counter.count}</p>
        <button onClick={() => counter.counter++}>Increase</button>
    </div>
  )
}
```

To adhere better to preferred object oriented patterns we could express the same as:

```ts
import { Signal, Service, Disposable, useService } from 'impact-app'

@Service()
export class Counter extends Disposable {
    @Signal()
    private _count = 0
    get count() {
        return this._count
    }
    increaseCount() {
        this._count++
    }
}

export const useCounter = () => useService(Counter)
```

Now we have properly encapsulated the functionality of the Counter and only expose the possibility to consume and increase the count:

```tsx
import { observe } from 'impact-app'
import { useCounter } from '../services/Counter'

export function CounterComponent() {
  using _ = observe()
  
  const counter = useCounter()

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
