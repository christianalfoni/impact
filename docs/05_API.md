# API

- [useStore](#useStore)
- [createScopeProvider](#createScopeProvider)
- [useCleanup](#useCleanup)
- [signal](#signal)
- [derive](#derive)
- [observe](#observe)
- [useObserve](#useobserve)
- [use](#use)
- [debugging signals](#debugging-signals)
- [emitter](#emitter)

## useStore

By default you stores are automatically registered globally and is shared by all components and other stores.

```tsx
import { useStore } from 'impact-app'

function OtherStore () {
    return {}
}

function MessageStore() {
    // Use the "useStore" hook in a store to consume an other store
    const otherStore = useStore(OtherStore)
    
    return {
        message: 'Hello World'
    }
}

function MessageComponent() {
    // Or use "useStore" in a component
    const messageStore = useStore(MessageStore)

    return <div>{messageStore.message}</div>
}
```

## createScopeProvider

Creating a `ScopeProvider` allows you to define what stores are shared by what components and other stores.

```tsx
import { createScopeProvider } from 'impact-app'
import { StoreA } from './StoreA'
import { StoreB } from './StoreB'
import { StoreC } from './StoreC'

export const SomeScopeProvider = createScopeProvider({
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

## useCleanup

It used in combination with store providers. When the `ScopeProvider` unmounts it will call this function for any stores resolved within the provider.

```ts
import { signal, useCleanup } from 'impact-app'

export function CounterStore() {
    const count = signal(0)

    const interval = setInterval(() => count.value++, 1000)

    useCleanup(() => clearInterval(interval))

    return {
        get count() {
            return count.value
        }
    }
}
```

## signal

Creates a value that can be observed by React. Signals are expected to be treated as immutable values, meaning you always need to assign a new value when changing them.

```ts
import { signal } from 'impact-app'

export function MessageStore() {
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
```

Signals has first class support for promises. That means when you add a promise to a signal, you'll get a `SignalPromise` back. This is the same promise as you passed in, only it is populated with some additional properties. These properties are the same React looks for when using the `use` hook to suspend a promise. The signal will automatically update as the promise resolves.

```ts
import { signal, useStore } from 'impact-app'

export function AsyncMessageStore() {
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

export const useAsyncMessage = () => useStore(AsyncMessageStore)
```

```tsx
import { observe } from 'impact-app'
import { useAsyncMessage } from '../stores/AsyncMessageStore'

function SomeComponent() {
    const { message } = useAsyncMessage()

    if (message.status === 'pending') {
        return <div>Loading message...</div>
    }

    if (message.status === 'rejected') {
        return <div>Error: {message.reason}</div>
    }


    return <h1>{message.value}</h1>
}

export default observe(SomeComponent)
```

Or you could suspend it:


```tsx
import { observe, use } from 'impact-app'
import { useAsyncMessage } from '../stores/AsyncMessageStore'

function SomeComponent() {
    const { message } = useAsyncMessage()
    const messageValue = use(message)

    return <h1>{messageValue}</h1>
}

export default observe(SomeComponent)
```

## derive

Creates a signal that lazily recomputes whenever any accessed signals within the derive callback changes. Also signals with promises are supported here.

```ts
import { signal, derive } from 'impact-app'

export function MessageStore() {
    const message = signal('Hello World')
    const shoutingMessage = derive(() => message.value + '!!!')
    
    return {
        get message() {
            return message.value
        },
        get shoutingMessage() {
            return shoutingMessage.value
        }
    }
}
```

## observe

To observe signals, and "rerender" the components, they need to bound to an `ObserverContext`. There are two ways you can achieve this. The default way is to use a traditional `observe` higher order component. 

```tsx
import { observe, useStore } from 'impact-app'
import { MessageStore } from '../stores/MessageStore'

function HelloWorld() {
    const messageStore = useStore(MessageStore)

    return <div>{messageStore.message}</div>
}

export default observe(HelloWorld)
```

But the approach above can result in anonymous component names and dictates to some extent how you can define and export components. Another approach, given you do a little bit of configuration is:

```tsx
import { observe, useStore } from 'impact-app'
import { MessageStore } from '../stores/MessageStore'

export function HelloWorld() {
    using _ = observe()

    const messageStore = useStore(MessageStore)

    return <div>{messageStore.message}</div>
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

## useObserve

An effect that will run whenever the signals accessed changes. Can be used both in stores and components.

```ts
function SomeStore() {
    const someOtherStore = useSomeOtherStore()

    useObserve(() => {
        if (someOtherStore.someSignalValue === 'foo') {
            console.log("HEY")
        }
    })

    return {}
}
```

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



