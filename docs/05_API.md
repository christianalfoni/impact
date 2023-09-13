# API

- [createHook](#createHook)
- [createHooksProvider](#createHooksProvider)
- [signal](#signal)
- [compute](#compute)
- [observe](#observe)
- [cleanup](#cleanup)
- [SuspensePromise](#suspensepromise)
- [emitter](#emitter)

## createHook

Create your hook. By default you hooks are automatically registered globally and is shared by all components.

```ts
import { createHook } from 'impact-app'

function HelloWorld() {
    return {
        message: 'Hello World'
    }
}

export const useHelloWorld = createHook(HelloWorld)
```

## createHooksProvider

Creating a `ReactiveHooksProvider` allows you to define what hooks are shared by what components. Typically you create one provider at the root of your component tree to capture all hooks resolvement and control which hooks are considered global to the application and which are scoped to specific pages/features.

```tsx
import { createHooksProvider } from 'impact-app'
import { useHookA } from './useHookA'
import { useHookB } from './useHookB'
import { useHookC } from './useHookC'

export const MyHooksProvider = createHooksProvider({
    useHookA,
    useHookB,
    useHookC
})
```

```tsx
import { MyHooksProvider } from './hooks'

function SomeComponent() {
    return (
        /*
            If a hook takes an argument, you will pass it here. Typed so that you will not miss it.
            The value is only used when resolving the hook, which means if you expect to "remount"
            the hook with a new initial value you will need to remount the provider
        */
        <MyHooksProvider useHookB={100}>
            <SomeComponent />
            <SomeOtherComponent />
        </MyHooksProvider>
    )
}
```

## signal

Creates a value that can be observed by React. Signals are expected to be treated as immutable values, meaning you always need to assign a new value when changing them.

```ts
import { createHook, signal } from 'impact-app'

function HelloWorld() {
    const message = signal('Hello World')

    return {
        get message() {
            return message.value
        }
    }
}

export const useHelloWorld = createHook(HelloWorld)
```

Under the hood signals uses [Immer](https://immerjs.github.io/immer/) which allows you to update the value by using a function. This function gives you the current value and you can use the normal mutation APIs and Immer returns an immutable value:

```ts
import { createHook, signal } from 'impact-app'

function HelloWorld() {
    const messages = signal<string[]>([])

    return {
        get messages() {
            return messages.value
        },
        addMessage(message: string) {
            messages.value = (draft) => {
                draft.push(message)
            }
        }
    }
}

export const useHelloWorld = createHook(HelloWorld)
```

### Debugging

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

## compute

Creates a signal that lazily recomputes whenever any accessed signals within the compute callback changes.

```ts
import { createHook, signal, compute } from 'impact-app'

function HelloWorld() {
    const message = signal('Hello World')
    const shoutingMessage = compute(() => message.value + '!!!')
    
    return {
        get message() {
            return message.value
        },
        get shoutingMessage() {
            return shoutingMessage.value
        }
    }
}

export const useHelloWorld = createHook(HelloWorld)
```

## observe

To observe signals, and "rerender" the components, they need to bound to an `ObserverContext`. There are two ways you can achieve this. The default way is to use a traditional `observe` higher order component. 

```tsx
import { observe } from 'impact-app'
import { useHelloWorld } from '../hooks/useHelloWorld'

function HelloWorld() {
    const helloWorld = useHelloWorld()

    return <div>{helloWorld.message}</div>
}

export default observe(HelloWorld)
```

But the approach above can result in anonymous component names and dictates to some extent how you can define and export components. Another approach, given you do a little bit of configuration is:

```tsx
import { observe } from 'impact-app'
import { useHelloWorld } from '../hooks/useHelloWorld'

export function HelloWorld() {
    using _ = observe()

    const helloWorld = useHelloWorld()

    return <div>{helloWorld.message}</div>
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

## useCleanup

It used in combination with reactive hooks providers. When the `ReactiveHooksProvider` unmounts it will call this function for any reactive hooks resolved within the provider.

```ts
import { createHook, signal, useCleanup } from 'impact-app'

function Counter() {
    const count = signal(0)

    const interval = setInterval(() => count.value++, 1000)

    useCleanup(() => clearInterval(interval))

    return {
        get count() {
            return count.value
        }
    }
}

export const useCounter = createHook(Counter)
```

## SuspensePromise

An enhanced promise which allows React to consume it directly in components. It is just an extended `Promise` which has some additional properties.

```ts
import { createHook, SuspensePromise } from 'impact-app'
import { useApi, PostDTO } from './Api'

function PostsCache() {
    const api = useApi()
    const cache: Record<string, SuspensePromise<PostDTO>> = {}

    return {
        getPost(id: string) {
            let existingPost = cache[id]

            if (!existingPost) { 
                cache[id] = existingPost = SuspensePromise.from(api.fetchPost(id))
            }
            
            return existingPost
        }
    }
}

export const usePostsCache = createHook(PostsCache)
```

And now in a component you can consume it directly:

```tsx
import { usePostsCache } from '../usePostsCache'

export const Post = ({ id }: { id: string }) => {
  const posts = usePostsCache()
  // When React gets its own "use" hook, you can use that instead
  const post = posts.getPost(id).use()
}
```

This promise throws to the closest Suspense boundary when pending and to the Error boundary when rejected. If the promise is already resolved it will synchronously resolve.

You can also use `SuspensePromise.fromValue` to create a resolved SuspensePromise.

## emitter

A typed event emitter which enables accessor pattern and disposal.

```ts
import { emitter, createHook } from 'impact-app'

function SomeHook() {
    const fooEmitter = emitter<string>()

    return {
        onFoo: fooEmitter.on,
        trigger() {
            fooEmitter.emit('WOOP!')
        }
    }
}

export const useSomeHook = createHook(SomeHook)
```



