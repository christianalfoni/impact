# API

- [createStore](#createStore)
- [createStoresProvider](#createStoresProvider)
- [signal](#signal)
- [compute](#compute)
- [observe](#observe)
- [cleanup](#cleanup)
- [SuspensePromise](#suspensepromise)
- [emitter](#emitter)

## createStore

Create your store. By default you stores are automatically registered globally and is shared by all components.

```ts
import { createStore } from 'impact-app'

function HelloWorld() {
    return {
        message: 'Hello World'
    }
}

export const useHelloWorld = createStore(HelloWorld)
```

## createStoresProvider

Creating a `StoresProvider` allows you to define what stores are shared by what components. Typically you create one provider at the root of your component tree to capture all store resolvement and control what stores are considered global to the application and what are scoped to specific pages/features.

```tsx
import { createStoresProvider } from 'impact-app'
import { useStoreA } from './useStoreA'
import { useStoreB } from './useStoreB'
import { useStoreC } from './useStoreC'

export const MyStoresProvider = createStoresProvider({
    useStoreA,
    useStoreB,
    useStoreC
})
```

```tsx
import { MyStoresProvider } from './stores'

function SomeComponent() {
    return (
        /*
            If a store takes an argument, you will pass it here. Typed so that you will not miss it.
            The value is only used when resolving the store, which means if you expect to "remount"
            the store with a new initial value you will have to remount the provider
        */
        <MyStoresProvider useStoreB={100}>
            <SomeComponent />
            <SomeOtherComponent />
        </MyStoresProvider>
    )
}
```

## signal

Creates a value that can be observed by React. Signals are expected to be treated as immutable values, meaning you always need to assign a new value when changing them.

```ts
import { createStore, signal } from 'impact-app'

function HelloWorld() {
    const message = signal('Hello World')

    return {
        get message() {
            return message.value
        }
    }
}

export const useHelloWorld = createStore(HelloWorld)
```

## compute

Creates a signal that lazily recomputes whenever any accessed signals within the compute callback changes.

```ts
import { createStore, signal, compute } from 'impact-app'

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

export const useHelloWorld = createStore(HelloWorld)
```

## observe

To observe signals and "rerender" the components needs to use an `ObserverContext`. There are two ways you can achieve this. The default way is to use a traditional `observer` higher order component. 

```tsx
import { observe } from 'impact-app'
import { useHelloWorld } from '../stores/useHelloWorld'

function HelloWorld() {
    const helloWorld = useHelloWorld()

    return <div>{helloWorld.message}</div>
}

export default observe(HelloWorld)
```

But with some configuration you can also:

```tsx
import { observe } from 'impact-app'
import { useHelloWorld } from '../stores/useHelloWorld'

export function HelloWorld() {
    using _ = observe()

    const helloWorld = useHelloWorld()

    return <div>{helloWorld.message}</div>
}
```

The benefit is that you avoid anonymous component names and no interference with how you want to define and export your components from the file.

<img align="center" src="https://github.com/christianalfoni/signalit/assets/3956929/5c4a8b43-27a2-4553-a710-146d94fbc612" width="25"/> **TypeScript 5.2**

Note that [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/) also needs to be updated to latest versions to support this version of TypeScript.

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

## cleanup

It used in combination with store providers. When the `StoresProvider` unmounts it will call this function for any resolved stores.

```ts
import { createStore, signal, cleanup } from 'impact-app'

function Counter() {
    const count = signal(0)

    const interval = setInterval(() => count.value++, 1000)

    cleanup(() => clearInterval(interval))

    return {
        get count() {
            return count.value
        }
    }
}

export const useCounter = createStore(HelloWorld)
```

## SuspensePromise

An enhanced promise which allows React to consume it directly in components. It is just an extended `Promise` which has some additional properties.

```ts
import { createStore, SuspensePromise } from 'impact-app'
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

export const usePostsCache = createStore(PostsCache)
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
import { emitter, createStore } from 'impact-app'

function SomeStore() {
    const fooEmitter = emitter<string>()

    return {
        onFoo: fooEmitter.on,
        trigger() {
            fooEmitter.emit('WOOP!')
        }
    }
}

export const useSomeStore = createStore(SomeStore)
```



