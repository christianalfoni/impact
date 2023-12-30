# Queries And Mutations

One of the most common things you do in any web application is to fetch data from the server and change data on the server. Under the hood this is based on promises, but React is not well suited for consuming promises. A suggested [new use hook](https://blixtdev.com/all-about-reacts-new-use-hook) allows you to consume promises directly in components in combination with suspense and error boundaries. This is great, but there is more to data fetching than consuming a promise in a component.

There are several data fetching solutions for React, like [useQuery](https://tanstack.com/query/v4/docs/react/reference/useQuery) and [useSWR](https://swr.vercel.app/), but these are tied to React and its reconciliation loop. These solutions really only provides data management, not state management.

**Impact** signals is a powerful primitive that makes promises observable and suspendable. This is a much lower abstraction than the above mentioned tools, but that makes them flexible and they can be used for all kinds of async state management, also queries and mutations.

```ts
import { context, signal } from 'impact-app'

// Imagine that we have a posts page where we want to
// fetch and cache any posts we open
export const usePostsContext = context(() => {
    // We cache any posts using a record of the post id
    // and the promise of the post as a signal
    const posts: Record<string, Signal<Promise<PostDTO>>> = {}

    return {
        fetchPost(id: string) {
            let post = posts[id]

            if (!postQuery) {
                // If we have no post, we grab it and store it in a signal
                post = posts[id] = signal(
                    fetch('/posts/' + id).then((response) => response.json())
                )
            }

            return post.value
        }
    }
})
```

At this point you might wonder why we are storing the promise and not the result of the promise. What to keep in mind here is that we are only creating a consumable asynchronous value that React can consume. That means we are not going to use this signal as the source of the post data, it just represents fetching the data.

When a signal initialises with a promise it will enhance it with status details. Whenever the promise status details update, so does the signal. That means you can observe data fetching and other asynchronous processes directly in your components. Additionally the status details added to the promise allows you to suspend the promise using the `use` hook. The React `use` hook is not available yet, so you can use the one from Impact in the meantime.

```tsx
import { use } from 'impact-app'
import { usePostsContext } from './usePostsContext'

function PostComponent({ id }: { id: string }) {
    const postsContext = usePostsContext()

    const post = use(postsContext.fetchPost(id))

    return (
        <div>
            <h1>{post.title}</h1>
            <p>
                {post.body}
            </p>
        </div>
    )
}
```

But maybe you do not want to use suspense, you just want to deal with the status of the promise directly in the component:

```tsx
import { observer } from 'impact-signal'
import { usePostsContext } from './usePostsContext'

const Post = ({ id }: { id: string }) => {
    const postsContext = usePostsContext()

    const postPromise = postsContext.fetchPost(id)

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

But data fetching is not only about getting and displaying data, it is also about mutations. We can use a promise signal to track the state of mutations.

```ts
import { context, signal } from 'impact-app'

const usePostContext = context((postData: PostDTO) => {
    const post = signal(postData)
    const changingTitle = signal<Promise<void>>()

    return {
        get post() {
            return post.value
        },
        get changingTitle() {
            return changingTitle.value
        },
        changeTitle(id: string, newTitle: string) {
            changingTitle.value = fetch({
                method: 'PUT',
                url: '/posts/' + id,
                data: {
                    title: newTitle
                }
            })
        }
    }
})
```

```tsx
import { usePostContext } from './'

function PostTitle() {
    const { post, changingTitle, changeTitle } = usePostContext()
    const [newTitle, setNewTitle] = useState(title)

    return (
        <div>
            <input
                disabled={changingTitle?.status === 'pending' ?? false}
                value={newTitle}
                onChange={(event) => setNewTitle(event.target.value)}
                onKeyDown={(event) => {
                    if (event.key === 'ENTER') {
                        changeTitle(id, newTitle)
                    }
                }}
            />
        </div>
    )
}
```