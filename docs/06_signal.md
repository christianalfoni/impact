# Signal

## Description

A signal is just a way to create an observable value. What makes Impact signals especially powerful is that they also make promises observable and suspendable. With an observable reactive primitive your components will only reconcile based on what signals they actually access.

## Learn

### signal

Creates a value that can be observed by React. Signals are expected to be treated as immutable values, meaning you always need to assign a new value when changing them.

```ts
import { signal, globalContext } from 'impact-app'

const useGlobalContext = globalContext(() => {
    const message = signal('Hello World')

    return {
        get message() {
            return message.value
        }
    }
})

function SomeComponent() {
    const { message } = useGlobalContext()

    return <h1>{message}</h1>
}
```

Signals has first class support for promises. That means when you add a promise to a signal, the promise becomes a `SignalPromise`. This is the same promise as you passed in, only it is populated with some additional properties and made observable. These properties are also the same React looks for when using the `use` hook to suspend a promise.

```tsx
import { signal, observer, globalContext } from 'impact-app'

const useGlobalContext = globalContext(() => {
    const helloWorldPromise = new Promise((resolve) => {
        setTimeout(() => resolve('Hello World!'), 2000)
    })

    const message = signal(helloWorldPromise)

    return {
        get message() {
            return message.value
        }
     }
})

function SomeComponent() {
    const { message } = useGlobalContext()

    if (message.status === 'pending') {
        return <div>Loading message...</div>
    }

    if (message.status === 'rejected') {
        return <div>Error: {message.reason}</div>
    }


    return <h1>{message.value}</h1>
})
```

Or you could suspend it:


```tsx
import { signal, observer, use } from 'impact-app'

const useGlobalContext = globalContext(() => {
    const helloWorldPromise = new Promise((resolve) => {
        setTimeout(() => resolve('Hello World!'), 2000)
    })

    const message = signal(helloWorldPromise)

    return {
        get message() {
            return message.value
        }
    }
})

function SomeComponent() {
    const { message } = useGlobalContext()

    const messageValue = use(message)

    return <h1>{messageValue}</h1>
})
```

### derived

Creates a signal that lazily recomputes whenever any accessed signals within the derived callback changes. Also signals with promises are supported here.

```ts
import { signal, derived, globalContext } from 'impact-app'

const useGlobalContext = globalContext(() => {
    const message = signal('Hello World')
    const shoutingMessage = derived(() => message.value + '!!!')

    return {
        get message() {
            return message.value
        },
        get shoutingMessage() {
            return shoutingMessage.value
        }
    }
})
```

The key "feature" of `derived` is that it's result will be memoized as long as signals consumed within it remain the same. This is in contrast to a standard getter that would be re-executed on each access:

```ts
import { signal, globalContext } from 'impact-app'

const useGlobalContext = globalContext(() => {
    const message = signal('Hello World')

    return {
        get message() {
            return message.value
        },
        get shoutingMessage() {
            return message.value + '!!!'
        }
    }
})
```



### effect

It will run whenever the signals accessed changes.

```ts
import { signal, effect, globalContext } from 'impact-signal'

const useGlobalContext = globalContext(() => {
    const message = signal('Hello World')

    effect(() => {
        console.log(message.value)
    })

    return {
        get message() {
            return message.value
        }
    }
})
```

### use

React is experimenting with a new hook called [use](https://blixtdev.com/all-about-reacts-new-use-hook) and until it becomes official you can use the one from Impact to suspend your signal promises.

```tsx
import { observer } from 'impact-app'
import { useGlobalContext } from '../useGlobalContext'

const DataComponent = observer(() => {
    const { api } = useGlobalContext()
    const data = use(api.fetchData())

    return <div>{data}</div>
})
```

