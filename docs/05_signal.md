# Signal

## Description

A signal is just a way to create an observable value. What makes Impact signals especially powerful is that they also make promises observable and suspendable. With an observable reactive primitive your components will only reconcile based on what signals they actually access.

## Learn

### signal

Creates a value that can be observed by React. Signals are expected to be treated as immutable values, meaning you always need to assign a new value when changing them.

```ts
import { signal, observer } from 'impact-app'

const message = signal('Hello World')

function SomeComponent() {
    using _ = observer()

    return <h1>{message.value}</h1>
}
```

Signals has first class support for promises. That means when you add a promise to a signal, the promise becomes a `SignalPromise`. This is the same promise as you passed in, only it is populated with some additional properties and made observable. These properties are also the same React looks for when using the `use` hook to suspend a promise.

```tsx
import { signal, observer } from 'impact-app'

const helloWorldPromise = new Promise<string>((resolve) => {
    setTimeout(() => resolve('Hello World!'), 2000)
})

const message = signal(helloWorldPromise)

function SomeComponent() {
    using _ = observer()

    const promisedMessage = message.value

    if (promisedMessage.status === 'pending') {
        return <div>Loading message...</div>
    }

    if (promisedMessage.status === 'rejected') {
        return <div>Error: {promisedMessage.reason}</div>
    }


    return <h1>{promisedMessage.value}</h1>
})
```

Or you could suspend it:


```tsx
import { signal, observer, use } from 'impact-app'

const helloWorldPromise = new Promise<string>((resolve) => {
    setTimeout(() => resolve('Hello World!'), 2000)
})

const message = signal(helloWorldPromise)

function SomeComponent() {
    using _ = observer()

    const messageValue = use(message.value)

    return <h1>{messageValue}</h1>
})
```

### derived

Creates a signal that lazily recomputes whenever any accessed signals within the derived callback changes. Also signals with promises are supported here.

```ts
import { signal, derived } from 'impact-app'

const message = signal('Hello World')
const shoutingMessage = derived(() => message.value + '!!!')
```

### effect

It will run whenever the signals accessed changes.

```ts
import { signal, effect } from 'impact-signal'

const message = signal('Hello World')

const dispose = effect(() => {
    console.log(message.value)
})
```

### observer

To observe signals, and "rerender" the components, they need to bound to an `ObserverContext`. There are two ways you can achieve this. The traditional way to approach this is using an `observer` higher order component. 

```tsx
import { observer, signal } from 'impact-app'

const message = signal('Hello World')

const HelloWorld = observer(() => {
    return <h1>{message.value}</h1>
})
```

But the approach above can result in anonymous component names and dictates to some extent how you can define and export components. Impact signals improves this using a new language feature called [explicit resource management](https://github.com/tc39/proposal-explicit-resource-management). This is in its last phase and ready to be shipped with JavaScript, and already available in TypeScript.

```tsx
import { observer, signal } from 'impact-app'

const message = signal('Hello World')

export function HelloWorld() {
    using _ = observer()    

    return <div>{message.value}</div>
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

