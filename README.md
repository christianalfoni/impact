# impact
Imperative apps for React

- [Install](#install)
- [Get Started](#get-started)
- [Dependency Injection](#dependency-injection)
- [API](#api)
  - [DependencyInjection](#dependencyinjection)
  - [ObservableEmitter](#observableemitter)
  - [ObservablePromise](#observablepromise)
  - [ObservableState](#observablestate)
  - [ObservableSubscription](#observablesubscription)
  - [ObservableBarrier](#observablebarrier)

# Install

```
yarn install impact-app
```

# Description

React with its reactive paradigm works increadibly well for building UIs. Writing components with hooks like **useState** and **useReducer** is a pure joy. Where React becomes challenging is when you need to deal with asynchronous flows, mutable state and side effects. Reacts primitives of **useEffect**, **useRef** and even **useState**, to instantiate singletons, are primitives that should not be asynchronous in nature and forces you to decouple code in a reactive way, which is hard to reason abuot.

Impact seeks to create a bridge between object oriented imperative logic and the reactive declarative world of React. It does this by providing some simple observable primitives and dependency injection for class consumption in components.

# Get started

```ts
import { ObservableState } from 'impact-app'

class Counter {
    count = new ObservableState(0)
    increase() {
        this.count.update((current) => current + 1)
    }
}

// Read further on how to expose classes using dependency injection
const counter = new Counter()

const CounterComponent = () => {
    const count = counter.count.use()
    
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

```tsx
import { DependencyInjection, ObservableState } from 'impact-app'

// You define your classes as interfaces. This allows you to expose different
// implementations in different environments, like testing
interface ICounter {
    count: ObservableState<number>
    increase(): void
}

// You create your class as normal
class Counter implements ICount {
    count = new ObservableState(0)
    increase() {
        this.count.update((current) => current + 1)
    }    
}

// You define your dependency injection with a record of interfaces
const di = new DependencyInjection<{
    Counter: ICounter
}>()

// A container provides the actual implementation to be used
const container = di.createContainer({
    Counter
})


const CounterComponent = () => {
    // The global dependency injector has no implementation, but the hook uses
    // the React context to consume a container with the implementation of the class
    const counter = di.useInject('Counter')
    const count = counter.count.use()
    
    return (
        <div>
          <p>{count}</p>
          <button onClick={() => counter.increase()}>Increase</button>
        </div>
    )
}

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

| Method | Description |
|--|--|
| di.**createContainer(classes)** | Pass the classes representing the implementation of the given interfaces |
| di.**inject(className)** | Injects the class into an other class |
| di.**useInject(className)** | Injects the class into a React component |
| di.**Provider** | The React provider for a container returned by **createContainer**, passed on **container** prop |

## ObservableEmitter<Event>

```ts
import { ObservableEmitter } from 'impact-app'

class Counter {
    onCount = new ObservableEmitter<number>()
    count = 0
    increase() {
        this.count++
        this.onCount.emit(this.count)
    }
}
```

| Method | Description |
|--|--|
| emitter.**emit(event)** | Emit an event |
| emitter.**subscribe(callback)** | Subscribe to the emitted event |
| emitter.**use(callback)** | Use in React component |

## ObservablePromise<Value>

```ts
import { ObservablePromise } from 'impact-app'

class AsyncCurrentDate {
    date = new ObservablePromise<Date>()
    increase() {
        this.date.set(Promise.resolve(new Date()))
    }
}
```

The value is expressed as a union of states:

```ts
type ObservablePromiseState<T> =
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

| Method | Description |
|--|--|
| promise.**get()** | Get current promise state |
| promise.**set(Promise<Value>)** | Set a promise that resolves the value. Replacing a pending promise will abort it. |
| promise.**subscribe(callback)** | Subscribe to the state changes |
| promise.**use()** | Use in React component |

## ObservableState<State>

```ts
import { ObservableState } from 'impact-app'

class Counter {
    count = new ObservableState(0)
    increase() {
        this.count.update((current) => current++)
    }
}
```

| Method | Description |
|--|--|
| state.**get()** | Get current state |
| state.**set(state)** | Set some state |
| state.**update(updateFunction)** | Set some state using update function with current value |
| state.**subscribe(callback)** | Subscribe to value changes |
| state.**use()** | Use the state in a React component |

## ObservableSubscription<State>

```ts
import { ObservableSubscription } from 'impact-app'

class Visibility {
    isVisible = new ObservableSubscription(
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
        // Only activate subscription when someone subscribes
        false
    )
}
```

| Method | Description |
|--|--|
| state.**get()** | Get current state |
| state.**subscribe(callback)** | Subscribe to state changes |
| state.**use()** | Use the state in a React component |

# Why the name Impact?
**Imperative React**... cute, right? 