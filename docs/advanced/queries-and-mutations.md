# Queries and Mutations

One of the most common things you do in any web application is fetching data from the server and changing data on the server. Under the hood, this is based on promises. A suggested [new use hook](https://blixtdev.com/all-about-reacts-new-use-hook) allows you to consume promises directly in components in combination with suspense and error boundaries. This is great, but managing these promises is not something React is good at or should even consider doing.

There are several data fetching solutions for React, like [react-query](https://tanstack.com/query/v4/docs/react/reference/useQuery) and [swr](https://swr.vercel.app/), which you can use in combination with **Impact**. But you can also choose to use signals.

**Impact** signals is a powerful primitive that makes promises observable and suspendable. This is a lower abstraction than the above mentioned tools, but that makes them flexible and usable for all kinds of async state management, including queries and mutations.

Traditionally, with global state management, you would do the data fetching inside your stores, but with **Impact**, you can choose to embrace React to do declarative data fetching. 

```ts
import { useStore, signal } from 'impact-react'

// Imagine that we have a posts page where we want to
// fetch and cache any posts we open
function PostsStore() {
  // We cache any queries for posts using a record of the post id
  // with the promise of the post as a signal
  const posts = {}

  return {
    fetchPost(id) {
      let post = posts[id]

      if (!post) {
        // If we have no post, we grab it and store it in a signal
        post = posts[id] = signal(
          fetch('/posts/' + id).then((response) => response.json())
        )
      }

      // We return the signal value, which is now an observable promise
      return post.value
    }
  }
}

export const usePostsStore = () => useStore(PostsStore)
```

The store acts as a cache for the initial data of posts. You choose how this cache operates. In this example, we never invalidate the cache, but you are free to do so at any time.

When a signal initializes with a promise, it will enhance it with status details. Whenever the promise status details update, so does the signal. That means you can observe data fetching and other asynchronous processes directly in your components. Additionally, the status details added to the promise allow you to suspend the promise using the `use` hook.

```tsx
import { use } from 'react'
import { usePostsStore } from './postsStore'

function Posts({ id }) {
  using postsStore = usePostsStore()
  const post = use(postsStore.fetchPost(id))

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

But maybe you do not want to use suspense and prefer to deal with the status of the promise directly in the component:

```tsx
import { usePostsStore } from './postsStore'

const Post = ({ id }) => {
  using postsStore = usePostsStore()
  const postPromise = postsStore.fetchPost(id)

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

However, data fetching is not only about getting and displaying data; it is also about mutations. We can use a promise signal to track the state of mutations.

We'll create a store for each Post so that we can manage changing its title, also dealing with optimistic updates and reverting.

```ts
import { useStore, store, createStoreProvider } from 'impact-app'

// We create a store for the Post displayed on the page and
// pass it the fetched data
function PostStore({ data }) {
  const post = store({
    ...data,
    // The value of the mutation state starts out as undefined
    changingTitle: undefined,
    changeTitle
  })

  function changeTitle(id, newTitle) {
    const oldTitle = post.data.title

    // Optimistically change the title
    post.title = newTitle

    post.changingTitle = fetch({
      method: 'PUT',
      url: '/posts/' + id,
      data: {
        title: newTitle
      }
    })

    // Revert to the previous value
    post.changingTitle.catch(() => {
      post.title = oldTitle
    })
  }
  
  return post
}

export const usePostStore = () => useStore(PostStore)
export const PostProvider = createStoreProvider(PostStore)
```

We can now consume this mutation signal to evaluate the state of the mutation declaratively in the component.

```tsx
import { usePostStore, PostProvider } from './'

function PostTitle() {
  using postStore = usePostStore()

  const { title, changingTitle, changeTitle } = postStore
  const [ newTitle, setNewTitle ] = useState(title)

  return (
    <div>
      <input
        // Now we can just check if we have a pending changing title
        disabled={changingTitle?.status === 'pending' ?? false}
        value={newTitle}
        onChange={(event) => setNewTitle(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'ENTER') {
            changeTitle(id, newTitle)
          }
        }}
      />
      {changingTitle?.status === 'rejected' ? 'Could not update title' : null}
    </div>
  )
}

function Post({ id }) {
  using postsStore = usePostsStore()
  
  const postData = use(postsStore.fetchPost(id))

  return (
    <PostProvider data={postData}>
      <PostTitle />
    </PostProvider>
  )
}
```
