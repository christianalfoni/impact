# API

- [store](#store)
- [signal](#signal)
- [derived](#derived)
- [observe](#observe)
- [observer](#observer)
- [use](#use)
- [scope](#scope)
- [cleanup](#cleanup)
- [emitter](#emitter)
- [debugging signals](#debugging-signals)

## store

By default you stores are automatically resolved globally and is shared by all components and other stores.

```tsx
import { store } from 'impact-app'

function OtherStore () {
    return {}
}

function MessageStore() {
    // Use it in a store to resolve an other store
    const otherStore = store(OtherStore)
    
    return {
        message: 'Hello World'
    }
}

function MessageComponent() {
    // Or use it in a component
    const messageStore = store(MessageStore)

    return <div>{messageStore.message}</div>
}
```



## signal

Creates a value that can be observed by React. Signals are expected to be treated as immutable values, meaning you always need to assign a new value when changing them.

```ts
import { signal, store } from 'impact-app'

export function HelloWorldStore() {
    const message = signal('Hello World')

    return {
        get message() {
            return message.value
        },
        setMessage(newMessage: string) {
            message.value = newMessage
        }
    }
}

export const useHelloWorld = () => store(HelloWorldStore)
```

Signals has first class support for promises. That means when you add a promise to a signal, the promise becomes a `SignalPromise`. This is the same promise as you passed in, only it is populated with some additional properties. These properties are the same React looks for when using the `use` hook to suspend a promise. The signal will automatically update as the promise resolves.

```ts
import { signal, store } from 'impact-app'

export function AsyncHelloWorldStore() {
    const message = signal(new Promise<string>((resolve) => {
        setTimeout(() => resolve('Hello World!'), 2000)
    }))

    return {
        get message() {
            return message.value
        },
        setMessage(newMessage: string) {
            // You can set the signal as normal using a promise.
            message.value = Promise.resolve(newMessage)
        }
    }
}

export const useAsyncHelloWorld = () => store(AsyncHelloWorldStore)
```

```tsx
import { observer } from 'impact-app'
import { useAsyncHelloWorld } from '../stores/AsyncHelloWorldStore'

function SomeComponent() {
    const { message } = useAsyncHelloWorld()

    if (message.status === 'pending') {
        return <div>Loading message...</div>
    }

    if (message.status === 'rejected') {
        return <div>Error: {message.reason}</div>
    }


    return <h1>{message.value}</h1>
}

export default observer(SomeComponent)
```

Or you could suspend it:


```tsx
import { observer, use } from 'impact-app'
import { useAsyncHelloWorld } from '../stores/AsyncHelloWorldStore'

function SomeComponent() {
    const { message } = useAsyncHelloWorld()
    const messageValue = use(message)

    return <h1>{messageValue}</h1>
}

export default observer(SomeComponent)
```

## derived

Creates a signal that lazily recomputes whenever any accessed signals within the derived callback changes. Also signals with promises are supported here.

```ts
import { signal, derived, store } from 'impact-app'

export function HelloWorldStore() {
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
}

export const useHelloWorld = () => store(HelloWorldStore)
```

## observe

An effect that can be used in stores. It will run whenever the signals accessed changes. It has an equivalent `useObserve` for components.

```ts
function SomeStore() {
    const someOtherStore = useSomeOtherStore()

    observe(() => {
        console.log(someOtherStore.value)
    })

    return {}
}
```

## observer

To observe signals, and "rerender" the components, they need to bound to an `ObserverContext`. There are two ways you can achieve this. The default way is to use a traditional `observer` higher order component. 

```tsx
import { observer } from 'impact-app'
import { useHelloWorld } from '../stores/HelloWorldStore'

function HelloWorld() {
    const { message } = useHelloWorld()

    return <div>{message}</div>
}

export default observer(HelloWorld)
```

But the approach above can result in anonymous component names and dictates to some extent how you can define and export components. Another approach, given you do a little bit of configuration is:

```tsx
import { observer } from 'impact-app'
import { useHelloWorld } from '../stores/HelloWorldStore'

export function HelloWorld() {
    using _ = observer()

    const { message } = useHelloWorld()

    return <div>{message}</div>
}
```

<img align="center" src="https://github.com/christianalfoni/signalit/assets/3956929/5c4a8b43-27a2-4553-a710-146d94fbc612" width="25"/> **TypeScript 5.2**

<br />

<img align="center" src="https://github.com/christianalfoni/signalit/assets/3956929/eb74b1ea-0ff1-4d18-9ba5-97150408ae86" width="25"/> **Babel**

```bash
yarn add @babel/plugin-proposal-explicit-resource-management -D
```

```json
{
    "plugins": [
        "@babel/plugin-proposal-explicit-resource-management"
    ]
}
```

This is a **Stage 3** proposal and is coming to JavaScript.

## use

React is experimenting with a new hook called [use](https://blixtdev.com/all-about-reacts-new-use-hook) and until it becomes official you can use the one from Impact to suspend your queries.

```tsx
import { observe } from 'impact-app'
import { useApi } from '../stores/ApiStore'

function Data() {
    const api = useApi()
    const data = use(api.data)

    return <div>{data}</div>
}

export default observe(Status)
```

## scope

Creating a `ScopeProvider` allows you to define what stores are shared by what components and other stores.

```tsx
import { scope } from 'impact-app'
import { StoreA } from './StoreA'
import { StoreB } from './StoreB'
import { StoreC } from './StoreC'

export const SomeScopeProvider = scope({
    StoreA,
    StoreB,
    StoreC
})
```

```tsx
import { SomeScopeProvider } from './stores'

function SomeComponent() {
    return (
        /*
            If a store takes an argument, you will pass it here. Typed so that you will not miss it.
            The value is only used when resolving the store, which means if you expect to "remount"
            the store with a new initial value you will need to remount the provider
        */
        <SomeScopeProvider StoreB={100}>
            <SomeComponent />
            <SomeOtherComponent />
        </SomeScopeProvider>
    )
}
```

## cleanup

Used in combination with store providers. When the `ScopeProvider` unmounts it will call this function for any stores resolved within the provider.

```ts
import { signal, onScopeDisposed } from 'impact-app'

export function CounterStore() {
    const count = signal(0)

    const interval = setInterval(() => count.value++, 1000)

    onScopeDisposed(() => clearInterval(interval))

    return {
        get count() {
            return count.value
        }
    }
}
```

## emitter

A typed event emitter which enables accessor pattern and disposal.

```ts
import { emitter } from 'impact-app'

export function SomeStore() {
    const fooEmitter = emitter<string>()

    return {
        onFoo: fooEmitter.on,
        trigger() {
            fooEmitter.emit('WOOP!')
        }
    }
}
```

## debugging signals

You can configure VSCode to open the file and position of signal changes and observations by clicking debug statements in the browser.

Make sure your project has a `.vscode/launch.json` file with the following contents:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "msedge",
      "request": "launch",
      "name": "Dev",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}"
    }
  ]
}
```

-  Make sure you have the [Edge](https://www.microsoft.com/en-us/edge?form=MA13FJ&exp=e00) browser installed (It is Chromium, so works just like Chrome)
- Start your dev server
- Use the Debug tool in VSCode and start it, this opens up Edge
- The first time Edge will ask you to set the the workspace folder. Navigate to the project folder on your computer and select it

**NOTE!** If it is not working and you are taken to the source tab, refresh the app



