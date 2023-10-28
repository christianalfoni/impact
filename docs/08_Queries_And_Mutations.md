# Queries And Mutations

One of the most common things you do in any web application is to fetch data from the server and change data on the server. Under the hood this is based on promises, but React is not well suited for consuming promises. A suggested [new use hook](https://blixtdev.com/all-about-reacts-new-use-hook) allows you to consume promises directly in components in combination with suspense and error boundaries. This is great, but there is more to data fetching than consuming a promise in a component.

There are several data fetching solutions for React, like [useQuery](https://tanstack.com/query/v4/docs/react/reference/useQuery) and [useSWR](https://swr.vercel.app/), but these are tied to your React and its reconciliation loop. That means you are forced to combine your data with Reacts state primitives and the reconciliation loop. They also have strong opinions about caching, refetching mechanisms etc. which is great for common data fetching patterns, but productivity apps typically needs lower level access to how data is managed.

**Impact** signals is a powerful primitive that makes promises observable and suspendable. That makes them a very good candidate for data fetching and mutations.

```ts
import { signal, context } from 'impact-app'

function SessionContext() {
    const posts: Record<string, Signal<Promise<PostDTO>>> = {}

    return {
        fetchPost(id: string) {
            let post = posts[id]

            if (!postQuery) {
                post = posts[id] = signal(
                    fetch('/posts/' + id).then((response) => response.json())
                )
            }

            return post.value
        }
    }
}

export const useSessionContext = context(SessionContext)
```

When a signal receives a promise it will enhance it with status details. Whenever the promise status details update, so does the signal. That means you can observe data fetching and other asynchronous processes. Additionally the status details added to the promise allows you to suspend the promise using the `use` hook.

```tsx
import { use } from 'impact-app'
import { useSessionContext } from '../useSessionContext'

const Post = ({ id }: { id: string }) => {
    const { fetchPost } = useSessionContext()
    const post = use(fetchPost(id))
}
```

But maybe you do not want to use suspense, you just want to deal with the status of the promise directly in the component:

```tsx
import { useStore } from 'impact-app'
import { useSessionContext } from '../useSessionContext'

const Post = ({ id }: { id: string }) => {
    const { fetchPost } = useSessionContext()
    const postPromise = fetchPost(id)

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

And then in some nested context you might also need access to the promise directly, which you can as it is still just a promise.

But data fetching is not only about getting and displaying data, it is also about mutations. We can use a promise signal to track the state of doing mutations.

```ts
import { signal, context } from 'impact-app'

function ProjectContext({ projectData }: { projectData: ProjectDTO }) {
    const project = signal(projectData)
    const changingTitle = signal<Promise<ProjectDTO>>()

    return {
        get id() {
            return project.value.id
        },
        get title() {
            return project.value.title
        },
        get changingTitle() {
            return changingTitle.value
        },
        changeTitle(id: string, newTitle: string) {
            project.value = {
                ...project.value,
                title: newTitle
            }

            changingTitle.value = fetch({
                method: 'PUT',
                url: '/posts/' + project.value.id,
                data: {
                    title: newTitle
                }
            })

            return changingTitle.value
        }
    }
}

export const useProjectContext = context(ProjectContext)
```

```tsx
import { observer } from 'impact-app'
import { useProjectContext } from '../useProjectContext'

function ProjectTitle() {
    const { changingTitle, changeTitle, title } = useProjectContext()
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

export default observer(Post)
```

**Impact** allows you to manage your data fetching across its contexts, your React hooks and components seamlessly.