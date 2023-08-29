# Promises

**Impact** takes advantage of the upcoming feature of first class support for promises in React. What this means in a nutshell is that React can now consume promises directly in components using a [use](https://blixtdev.com/all-about-reacts-new-use-hook/) hook.

The `SuspensePromise` enhances a normal promise and adds the status of the promise so React can access it synchronously, making i compatible with the future **use** hook. It also adds the upcoming `use` hook as a method on the promise until it becomes available in React. That means when we want to expose a promise to React we can use a `SuspensePromise`.

```ts
import { SuspensePromise, createHook } from 'impact-app'
import { useApi, PostDTO } from './useApi'

function Posts() {
    const api = useApi()
    const posts: Record<string, SuspensePromise<PostDTO>> = {}

    return {
        fetchPost(id: string) {
            let post = posts[id]

            if (!post) {
                posts[id] = post = SuspensePromise.from(api.getPost(id))
            }

            return post
        }
    }
}

export const usePosts = createHook(Posts)
```

The `SuspensePromise` is just a promise, but enhanced with additional state and a `use` method. When consumed in a component using the `use` method, it will throw to the suspense boundary if pending, to the error boundary if rejected or resolve synchronously if already resolved.

```tsx
import { usePosts } from '../hooks/usePosts'

const Post = ({ id }: { id: string }) => {
    using posts = usePosts()
    const post = posts.fetchPost(id).use()
}
```

## Asynchronous values

Often we think about promises as a way to aquire a value asynchronously, but promises are values themselves. Like the example above we do not store the resolved value in our cache, we store the promise. When state needs to be asynchronously instantiated it can be a good idea to store the promise itself and when the value needs to be updated, you just store a new promise. With `SuspensePromise` you can resolve to a new value.

```ts
import { signal, createHook, SuspensePromise, cleanup, useSignal } from 'impact-app'
import { useApi, StatusDTO } from './useApi'

function Status() {
    const api = useApi()
    const status = signal(SuspensePromise.from(api.getStatus()))
    const disposeStatusListener = api.subscribeStatus(onStatusUpdate)

    cleanup(disposeStatusListener)

    function onStatusUpdate(updatedStatus: StatusDTO) {
        status.value = SuspensePromise.from(updatedStatus)
    }

    return {
        get status() {
            return status.value
        }
    }
}


export const useStatus = createHook(Status)
```

Now any component can `use` this status reactively and it does not matter if it is initially being loaded or updated. There is no management or typing around its state.

