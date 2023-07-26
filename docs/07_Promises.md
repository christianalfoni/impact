
# Promises

With an objected oriented external layer we have an opportunity to take advantage of the upcoming feature of first class support for promises in React. What this means in a nutshell is that React can now consume promises directly in components using a [use](https://blixtdev.com/all-about-reacts-new-use-hook/) hook.

The `AsyncSignal` from **SignalIt** extends a normal promise and adds the status of the promise so React can access it synchronously, making i compatible with the future **use** hook. It also adds the upcoming `use` hook as a method on the promise until it becomes available in React. That means when we want to expose a promise to React we can use an `AsyncSignal`.

```ts
import { signal, CachedPromise, asCachedPromise, Service } from 'impact-app'
import { Api, PostDTO } from './Api'

@Service()
export class Posts {
    private _posts: Record<string, AsyncSignal<PostDTO>>
    constructor(private _api: Api) {}
    fetchPost(id: string) {
        if (!this._posts[id]) {
            this._posts[id] = asyncSignal(this._api.getPost(id))
        }

        return this._posts[id]
    }
}
```

The `AsyncSignal` value is just a promise, but enhanced with additional state and a `use` method. When consumed in a component using the `use` method, it will throw to the suspense boundary if pending, to the error boundary if rejected or resolve synchronously if already resolved. In the object oriented context you would just consume the promise as normal.

```tsx
import { useService } from 'impact-app'
import { Posts } from '../services'

const Post = ({ id }: { id: string }) => {
    const posts = useService(Posts)
    const post = posts.fetchPost(id).use()
}
```

## Asynchronous values

Often we think about promises as a way to aquire a value asynchronously, but promises are values themselves. Like the example above we do not store the resolved value in our cache, we store the promise. When state needs to be asynchronously instantiated it can be a good idea to store the promise itself and when the value needs to be updated, you just store a new promise. With **SignalIt** you can update an existing `AsyncSignal` with a new value and the underlying promise is updated.

```ts
import { AsyncSignal, asyncSignal, Service, Disposable } from 'impact-app'
import { Api, StatusDTO } from './Api'

@Service()
export class Status extends Disposable {
    #status: AsyncSignal<StatusDTO>
    get status() {
        return this.#status.value
    }
    constructor(api: Api) {
        this.#status = asyncSignal(api.getStatus())
        this.onDispose(api.subscribeStatus((status) => {
            this.#status.value = status
        }))
    }
}
```

