# impact
Imperative apps for React

- [Install](#install)
- [Get Started](#get-started)
- [Dependency Injection](#dependency-injection)
- [API](#api)
  - [DependencyInjection](#dependencyinjection)
  - [Emitter](#emitter)
  - [Promise](#promise)
  - [Value](#value)
  - [Subscription](#subscription)
  - [Barrier](#barrier)
  - [Computed](#computed)

# Install

```
yarn install impact-app
``` 

# Description

React works really well to build UIs. Where React becomes challenging is when its reactive paradigm creates code where a change of state in one component creates unknown side effects in other components. With a dispatch or a setState it is difficult to follow what happens next. In imperative programming you call a method and the method describes exactly what happens. What state is changed and what other side effects occur.

Impact seeks to create a bridge between object oriented imperative logic and the reactive declarative world of React. It does this by providing some simple observable primitives and dependency injection for class consumption in components.

# Get started

```ts
import * as Impact from 'impact-app'

class Counter {
    private _count = Impact.value(0)
    useCount = this._count.use
    increase() {
        this._count.update((current) => current + 1)
    }
}

// Read further on how to expose classes using dependency injection
const counter = new Counter()

const CounterComponent = () => {
    const count = counter.useCount()
    
    return (
        <div>
          <p>{count}</p>
          <button onClick={() => counter.increase()}>Increase</button>
        </div>
    )
}
```

# Dependency Injection

You want to avoid creating global class instances like in the _Get Started_ example. Instead of composing a nested structure of classes and instantiate them all, _Impact_ gives you dependency injection.

| Method | Description |
|--|--|
| di.**createContainer(classes)** | Pass the classes representing the implementation of the given interfaces |
| di.**inject(className)** | Injects the class into an other class |
| di.**useInject(className)** | Injects the class into a React component |
| di.**Provider** | The React provider for a container returned by **createContainer**, passed on **container** prop |

```tsx
import * as Impact from 'impact-app'

// You define your classes as interfaces. This allows you to expose different
// implementations in different environments, like testing
interface ICounter {
    count: Impact.Value<number>
    increase(): void
}

// You create your class as normal
class Counter implements ICount {
    private _count = Impact.value(0)
    useCount = this._count.use
    increase() {
        this._count.update((current) => current + 1)
    }    
}

// You define your dependency injection with a record of interfaces
const di = new DependencyInjection<{
    Counter: ICounter
}>()

const CounterComponent = () => {
    // The global dependency injector has no implementation, but the hook uses
    // the React context to consume a container with the implementation of the class
    const counter = di.useInject('Counter')
    const count = counter.useCount()
    
    return (
        <div>
          <p>{count}</p>
          <button onClick={() => counter.increase()}>Increase</button>
        </div>
    )
}

// A container provides the actual implementation to be used
const container = di.createContainer({
    Counter
})


// The dependency injector instance has a Provider to provide a container
// with the implementation of the classes
const App = () => {
    return (
        <di.Provider container={container}>
            <CounterComponent />
        </di.Provider>
    )
}
```

All injection are singletons, meaning you will always get the same instance. Read more to learn about creating multiple instances and injecting a class into an other classs.

# API

## DependenyInjection<Inferfaces>

```ts
import { DependencyInjection } from 'impact-app'

interface IClassA {}

interface IClassB {}

const di = new DependencyInjection<{
    ClassA: IClassA,
    ClassB: IClassB
}>()
```



## Emitter<Event>

| Method | Description |
|--|--|
| emitter.**emit(event)** | Emit an event |
| emitter.**subscribe(callback)** | Subscribe to the emitted event |
| emitter.**use(callback)** | Use in React component |

```ts
import * as Impact from 'impact-app'

class SomeThingAsync {
    private _onErrorEmitter = Impact.emitter<string>()
    useOnError = this._onErrorEmitter.use
    
    doSomethingAsync() {
        doAsync()
          .then(() => {})
          .catch(() => {
              this._onErrorEmitter.emit('Something bad happened')
          })
    }
}
```



## Promise<Value>

| Method | Description |
|--|--|
| promise.**get()** | Get current promise state |
| promise.**set(Promise<Value>)** | Set a promise that resolves the value. Replacing a pending promise will abort it. |
| promise.**subscribe(callback)** | Subscribe to the state changes |
| promise.**use()** | Use in React component |

```ts
import * as Impact from 'impact-app'

class AsyncCurrentDate {
    private _date = Impact.promise<Date>()
    useDate = this._date.use
    increase() {
        this.date.set(Promise.resolve(new Date()))
    }
}
```

The value is expressed as a union of states:

```ts
type PromiseState<T> =
  | {
      status: "IDLE";
    }
  | {
      status: "PENDING";
      controller: AbortController;
      promise: Promise<T>;
    }
  | {
      status: "RESOLVED";
      value: T;
    }
  | {
      status: "REJECTED";
      error: unknown;
    };
```

## Value<Value>

| Method | Description |
|--|--|
| value.**get()** | Get current state |
| value.**set(state)** | Set some state |
| value.**update(updateFunction)** | Set some state using update function with current value |
| value.**subscribe(callback)** | Subscribe to value changes |
| value.**use()** | Use the state in a React component |

```ts
import * as Impact from 'impact-app'

class Counter {
    private _count = Impact.value(0)
    useCount = this._count.use
    increase() {
        this._count.update((current) => current++)
    }
}
```

## Subscription<State>

| Method | Description |
|--|--|
| subscription.**get()** | Get current state |
| subscription.**subscribe(callback)** | Subscribe to state changes |
| subscription.**use()** | Use the state in a React component |

```ts
import * as Impact from 'impact-app'

class Visibility {
    private _visibility = Impact.subscription(
        // Initial value
        document.visibilityState === 'visible',
        // Subscription updating the value
        (update) => {
            const listener = () => {
               update(document.visibilityState === 'visible') 
            }
            window.addEventListener('visibilitychange', listener)
            
            return () => {
                window.removeEventListener('visibilitychange', listener)
            }
        },
        // Default inactive, will only activate subscription when someone subscribes
        false
    )
    useVisibility = this.visibility.use
    onVisible = this.visibility.subscribe
    get isVisible {
        return this._visibility.get()
    }
    
}
```

## ObservableBarrier<Result>

| Method | Description |
|--|--|
| barrier.**get()** | Get current state of the barrier |
| barrier.**subscribe(callback)** | Subscribe to state changes |
| barrier.**enable()** | Initialises the barrier and returns the blocking promise |
| barrier.**resolve(result)** | Resolves the barrier promise with the value |
| barrier.**reject(error)** | Rejects the barrier promise with the error |
| barrier.**use()** | Use the state in a React component |

```ts
import { ObservableBarrier } from 'impact-app'

class AlertModal {
    private _alertBarrier = new ObservableBarrier<'yes' | 'no' | null>()
    useModal = this._alertBarrier.use
    show() {
        return this._alertBarrier.enable()
    }
    hide() {
        this._alertBarrier.resolve(null)
    }
    async executeRandomAsyncAnswer() {
        try {
          const answer = await getRandomAsyncAnswer<'yes' | 'no'>()    
          this._alertBarrier.resolve(answer)
        } catch (error) {
          this._alertBarrier.reject(error)
        }
    }
    
    
}
```

The barrier state is expressed as:

```ts
type ObservableBarrierState<T> =
  | {
      status: "ACTIVE";
      promise: Promise<T>;
      resolve: (value: T) => void;
      reject: (error: unknown) => void;
    }
  | {
      status: "INACTIVE";
    }
  | {
      status: "RESOLVED";
      result: T;
    }
  | {
      status: "REJECTED";
      error: unknown;
    }
```



# Why the name Impact?
**Imperative React**... cute, right? 