# Queries And Mutations

One of the most common things you do in any web application is to fetch data from the server and change data on the server. Under the hood this is based on promises, but React is not well suited for consuming promises. A suggested [new use hook](https://blixtdev.com/all-about-reacts-new-use-hook) for React allows you to consume promises directly in components in combination with suspense and error boundaries. This is great, but there is more to data fetching than consuming a promise in a component.

There are several data fetching solutions for React, like [useQuery](https://tanstack.com/query/v4/docs/react/reference/useQuery) and [useSWR](https://swr.vercel.app/), but these are tied to your React components. That means you can not access and manage this data in an external state management layer. They also have strong opinions about caching, refetching mechanisms etc.

**Impact** signals is a powerful primitive that makes promises observable and suspendable. That makes them a very good candidate for data fetching and mutations.

```ts
import { query, Query } from 'impact-app'

export function ApiStore() {
    const postQueries: Record<string, Signal<Promise<PostDTO>>> = {}

    return {
        fetchPost(id: string) {
            let postQuery = postQueries[id]

            if (!postQuery) {
                postQuery = postQueries[id] = signal(fetch('/posts/' + id).then((response) => response.json()))
            }

            return postQuery.value
        }
    }
}
```

When a signal receives a promise it will enhance it with status details. Whenever the promise status details update, so does the signal. That means you can observe data fetching and other asynchronous processes. Additionally the status details added to the promise allows you to suspend the promise using the `use` hook.

```tsx
import { use } from 'impact-app'
import { useApi } from '../stores/ApiStore'

const Post = ({ id }: { id: string }) => {
    const api = useApi()
    const post = use(api.fetchPost(id))
}
```

But maybe you do not want to use suspense, you just want to deal with the status of the promise directly in the component:

```tsx
import { useStore } from 'impact-app'
import { useApi } from '../stores/ApiStore'

const Post = ({ id }: { id: string }) => {
    const api = useApi()
    const postPromise = api.fetchPost(id)

    if (postPromise.status === 'pending') {
        return <div>Loading...</div>
    }

    if (postPromise.status === 'rejected') {
        return <div>Some error: {postPromise.reason}</div>
    }

    const post = postPromise.value

    return <div>{post.title}</div>
}
```

And then in some store you might also need access to the promise directly, which you can as it is still just a promise. So there are different tools for different scenarios.

But data fetching is not only about getting and displaying data, it is also about mutations. We can use a promise signal to track the state of doing mutations.

```ts
import { signal, Signal, useStore } from 'impact-app'

export function ApiStore() {
    const postQueries: Record<string, Signal<Promise<PostDTO>>> = {}
    const changingPostTitle = signal<Promise<PostDTO>>()

    return {
        fetchPost(id: string) {
            let postQuery = postQueries[id]

            if (!postQuery) {
                postQuery = postQueries[id] = signal(fetch('/posts/' + id).then((response) => response.json()))
            }

            return postQuery.value
        },
        get changingPostTitle() {
            return changingPostTitle.value
        },
        changePostTitle(id: string, newTitle: string) {
            const request = fetch({
                method: 'PUT',
                url: '/posts/' + id,
                data: {
                    title: newTitle
                }
            })

            changingPostTitle.value = request

            return request
        }
    }
}

export const useApi = () => useStore(ApiStore)
```

```tsx
import { observe } from 'impact-app'
import { useApi } from '../stores/ApiStore'

const Post = ({ id }: { id: string }) => {
    const { changingPostTile, changePostTitle } = useApi()
    const [title, setTitle] = useState('')

    return (
        <div>
            <input
                disabled={changingPostTile?.status === 'pending' ?? false}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                onKeyDown={(event) => {
                    if (event.key === 'ENTER') {
                        changePostTitle(id, title)
                    }
                }}
            />
        </div>
    )
}
```

**Impact** allows you to manage your data fetching across its stores, your React hooks and components seamlessly.