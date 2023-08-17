
# Promises

With an objected oriented external layer we have an opportunity to take advantage of the upcoming feature of first class support for promises in React. What this means in a nutshell is that React can now consume promises directly in components using a [use](https://blixtdev.com/all-about-reacts-new-use-hook/) hook.

The `SuspensePromise` enhances a normal promise and adds the status of the promise so React can access it synchronously, making i compatible with the future **use** hook. It also adds the upcoming `use` hook as a method on the promise until it becomes available in React. That means when we want to expose a promise to React we can use a `SuspensePromise`.

```ts
import { SuspensePromise, Service, Disposable, useService } from 'impact-app'
import { Api, PostDTO } from './Api'

@Service()
export class Posts extends Disposable {
    private posts: Record<string, SuspensePromise<PostDTO>>
    constructor(private api: Api) {}
    fetchPost(id: string) {
        let post = this.posts[id]
        
        if (!post) {
            this.posts[id] = post = SuspensePromise.from(this.api.getPost(id))
        }

        return post
    }
}

export const usePosts = () => useService(Posts)
```

The `SuspensePromise` is just a promise, but enhanced with additional state and a `use` method. When consumed in a component using the `use` method, it will throw to the suspense boundary if pending, to the error boundary if rejected or resolve synchronously if already resolved. In the object oriented context you would just consume the promise as normal.

```tsx
import { usePosts } from '../services'

const Post = ({ id }: { id: string }) => {
    const posts = usePosts()
    const post = posts.fetchPost(id).use()
}
```

## Asynchronous values

Often we think about promises as a way to aquire a value asynchronously, but promises are values themselves. Like the example above we do not store the resolved value in our cache, we store the promise. When state needs to be asynchronously instantiated it can be a good idea to store the promise itself and when the value needs to be updated, you just store a new promise. With `SuspensePromise` you can resolve to a new value.

```ts
import { SuspensePromise, Service, Signal, Disposable, useService } from 'impact-app'
import { Api, StatusDTO } from './Api'

@Service()
export class Status extends Disposable {
    @Signal()
    protected status: SuspensePromise<StatusDTO>
    
    constructor(api: Api) {
        this.status = SuspensePromise.from(api.getStatus())
        
        this.onDispose(api.subscribeStatus((status) => {
            this.status = SuspensePromise.fromValue(status)
        }))
    }
}

export const useStatus = () => useService(Status)
```

When the status value is changed it is changed to an already resolved promise which React will synchronously read, meaning when the signal triggers the value is ready to be consumed.

