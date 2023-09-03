# API

- [createHook](#createhook)
- [createHooksProvider](#createhooksprovider)
- [signal](#signal)
- [compute](#compute)
- [cleanup](#cleanup)
- [SuspensePromise](#suspensepromise)
- [emitter](#emitter)

## createHook

Create your hook using the hook constructor. By default you hooks are automatically registered globally and is shared by all components.

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

Creating a `HooksProvider` allows you to define what hooks are shared by what components. Typically you create one provider at the root of your component tree to capture all hook resolvement and control what hooks are considered global to the application and what are scoped to specific pages/features.

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
            the hook with a new initial value you will have to remount the provider
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

To observe signals the hook needs to use the `using` keyword in a component:

```tsx
import { useHelloWorld } from '../hooks/useHelloWorld'

function HelloWorld() {
    using helloWorld = useHelloWorld()

    return <div>{helloWorld.message}</div>
}
```

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

## cleanup

It used in combination with hook providers. When the `HooksProvider` unmounts it will call this function for any resolved hooks.

```ts
import { createHook, signal, cleanup } from 'impact-app'

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

export const useCounter = createHook(HelloWorld)
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
  using posts = usePostsCache()
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



