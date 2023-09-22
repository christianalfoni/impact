# Queries And Mutations

One of the most common things you do in any web application is to fetch data from the server and change data on the server. Under the hood this is based on promises, but React is not well suited for consuming promises. A suggested [new use hook](https://blixtdev.com/all-about-reacts-new-use-hook/) for React allows you to consume promises directly in components in combination with suspense and error boundaries. This is great, but there is more to data fetching than consuming a promise in a component.

There are several data fetching solutions for React, like [useQuery](https://tanstack.com/query/v4/docs/react/reference/useQuery) and [useSWR](https://swr.vercel.app/), but these are tied to your React components. That means you can not access and manage this data in an external state management layer.

That is why **Impact** ships with its own primitive which allows you to manage data fetching with your general state management and still consume it in components.

```ts
import { queries, createHook } from 'impact-app'

function Api() {
    return {
        posts: queries((id: string) => {
            return fetch('/posts/' + id).then((response) => response.json())
        }),
        changePostTitle: mutations((id: string, title: string) => {
            return fetch('/posts/' + id).then((response) => response.json()) 
        })
    }
}

export const useApi = createHook(Api)
```

`queries` will automatically cache and update consumers of the query when it changes. An example of this is using suspense in a component. It requires the first argument to be a unique identifier.

```tsx
import { useApi } from '../hooks/useApi'

const Post = ({ id }: { id: string }) => {
    const api = useApi()
    const post = api.posts.suspend(id)
}
```

But maybe you do not want to use suspense, you just want to deal with the states of the query directly in the component:

```tsx
import { useApi } from '../hooks/useApi'

const Post = ({ id }: { id: string }) => {
    const api = useApi()
    const postState = api.posts.fetch(id)

    if (postState.status === 'pending') {
        return <div>Loading...</div>
    }

    if (postState.status === 'rejected') {
        return <div>Some error: {postState.reason}</div>
    }

    const post = postState.value

    return <div>{post.title}</div>
}
```

Or maybe you need to do some layout effect related to a `fulfilled` query?

```tsx
import { useApi } from '../hooks/useApi'

const Post = ({ id }: { id: string }) => {
    const api = useApi()
    
    useLayoutEffect(() => api.posts.onStatusChange(id, (postState) => {
        if (postState.status === 'fulfilled') {
            // Do something
        }
    }), [])

    return <div></div>
}
```

And then in some hook you might also need access to the data where `getValue` is the method you use to consume a query as a pure promise. So there are different tools for different scenarios.

But data fetching is not only about getting and displaying data, it is also about mutations. 

```tsx
import { useState } from 'react'
import { useApi } from '../hooks/useApi'

const Post = ({ id }: { id: string }) => {
    const api = useApi()
    const [title, setTitle] = useState('')
    const changePostTitleState = api.changePostTitle.subscribe(id)

    return (
        <div>
            <input
                disabled={changePostTitleState.status === 'pending'}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                onKeyDown={(event) => {
                    if (event.key === 'ENTER') {
                        changePostTitleState.mutate(id, title)
                    }
                }}
            />
        </div>
    )
}
```

**Impact** allows you to manage your data fetching across its own hooks, your React hooks and components seamlessly.