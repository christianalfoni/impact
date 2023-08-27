# API

- [useGlobalReactiveHook](#useglobalreactivehook)
- [useSignal](#useSignal)
- [useCompute](#compute)
- [observe](#observe)
- [SuspensePromise](#suspensepromise)
- [emitter](#emitter)
- [ReactiveHooksProvider](#reactivehooksprovider)
- [useReactiveHook](#usereactivehook)
- [useDispose](#usedispose)

## useGlobalReactiveHook

The hook that allows you to consume a reactive hook implementation in any component.

```ts
import { useGlobalReactiveHook } from 'impact-app'

export function HelloWorld() {
    return {
        message: 'Hello World'
    }
}

export const useHelloWorld = () => useGlobalReactiveHook(HelloWorld)
```

> Do **NOT** define your reactive hooks inline with this function, as that will change the reference every time it is run

## useSignal

Creates a value that can be observed by React. Signals are expected to be treated as immutable values, meaning you always need to assign a new value when changing them.

```ts
import { useGlobalReactiveHook, useSignal } from 'impact-app'

function HelloWorld() {
    const message = useSignal('Hello World')

    return {
        get message() {
            return message.value
        }
    }
}

export const useHelloWorld = () => useGlobalReactiveHook(HelloWorld)
```

## useCompute

Creates a signal that lazily recomputes whenever any accessed signals within the compute callback changes.

```ts
import { useGlobalReactiveHook, useSignal, useCompute } from 'impact-app'

function HelloWorld() {
    const message = useSignal('Hello World')
    const shoutingMessage = useCompute(() => message.value + '!!!')
    
    return {
        get message() {
            return message.value
        },
        get shoutingMessage() {
            return shoutingMessage.value
        }
    }
}

export const useHelloWorld = () => useGlobalReactiveHook(HelloWorld)
```

## observe

Observes signals in components and reconciles the component when the signal changes.

```tsx
import { observe } from 'impact-app'
import { useHelloWorld } from './useHelloWorld'

export function HelloWorld() {
    using _ = observe()

    const helloWorld = useHelloWorld()

    return <div>{helloWorld.message}</div>
}
```

## SuspensePromise

An enhanced promise which allows React to consume it directly in components. It is just an extended `Promise` which has some additional properties.

```ts
import { useReactiveHook, SuspensePromise } from 'impact-app'
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

export const usePostsCache = () => useReactiveHook(PostsCache)
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
import { emitter, useReactiveHook } from 'impact-app'

function SomeReactiveHook() {
    const fooEmitter = emitter<string>()

    return {
        onFoo: fooEmitter.on,
        trigger() {
            fooEmitter.emit('WOOP!')
        }
    }
}
```

## ReactiveHooksProvider

Allows you to specifiy a component tree with its own instances of reactive hooks. These hooks will also dispose of themselves when the provider unmounts. This is also very useful for testing, where any reactive hook can be mocked.

```tsx
import { ReactiveHooksProvider } from 'impact-app'
import { SomeExternalTool } from 'some-cool-tool-package'
import { HookA, HookA, HookC } from './reactive-hooks'

const someExternalTool = new SomeExternalTool()
const config = {}

export const Main = () => {
    return (
        <ReactiveHooksProvider hooks={[
            // Now any child consuming this hook will get the same instance
            HookA, 
            
            // Use a tuple to create a custom constructor to provide initial state
            [HookB, () => HookB(123)],

            // Use the same mechanism to mock the result of a hook during testing
            [HookC, () => ({ message: 'Mip mop' })]
        ]}>
            <App />
        </ReactiveHooksProvider>
    )
}
```

## useReactiveHook

The hook requires the reactive hook to be registered with a parent `ReactiveHooksProvider` to be consumed. It will throw an error if there is not parent provider with this registered hook.

```ts
import { useReactiveHook } from 'impact-app'

export function HelloWorld() {
    return {
        message: 'Hello World'
    }
}

export const useHelloWorld = () => useReactiveHook(HelloWorld)
```


## useDispose

When a reactive hook is provided through a `ReactiveHooksProvider` it will run a disposer when the provider unmounts.

```ts
import { useReactiveHook, useSignal, useDispose } from 'impact-app'

function Counter() {
    const count = useSignal(0)

    const interval = setInterval(() => count.value++, 1000)

    useDispose(() => clearInterval(interval))

    return {
        get count() {
            return count.value
        }
    }
}

export const useCounter = () => useReactiveHook(HelloWorld)
```