# Queries and Mutations

One of the most common things you do in any web application is fetching data from the server and changing data on the server. Under the hood, this is based on promises. The [new use hook](https://blixtdev.com/all-about-reacts-new-use-hook) allows you to consume promises directly in components in combination with suspense and error boundaries. This is great, but managing these promises is not something React is good at or should even consider doing.

There are several data fetching solutions for React, like [react-query](https://tanstack.com/query/v4/docs/react/reference/useQuery) and [swr](https://swr.vercel.app/), which you can use in combination with **Impact**. But you can also choose to use signals.

**Impact** signals is a powerful primitive that makes promises observable and suspendable. This is a lower abstraction than the above mentioned tools, but that makes them flexible and usable for all kinds of async state management, including queries and mutations.

```ts
import { signal, useStore } from "impact-react";

export const usePostsStore = () => useStore(PostsStore);

// Imagine that we have a posts page where we want to
// fetch and cache any posts we open
function PostsStore() {
  const { subscribePosts } = useApiStore();
  // We cache any queries for posts using a record of the post id
  // with the promise of the post as a signal
  const posts = {};

  // We subscribe to post updates and update any posts
  // we have fetched
  cleanup(
    subscribePosts((post) => {
      if (posts[post.id]) {
        posts[post.id](Promise.resolve(post));
      }
    }),
  );

  return {
    fetchPost(id) {
      let post = posts[id];

      if (!post) {
        // If we have no post, we grab it and store it in a signal
        post = posts[id] = signal(fetchPost(id));
      }

      // We return the signal value, which is now an observable promise
      return post();
    },
  };

  async function fetchPost(id) {
    const response = await fetch("/posts/" + id);

    return response.json();
  }
}
```

You choose how this cache operates. In this example, we never invalidate the cache, but you are free to do so at any time. You could also subscribe to the posts to keep them up to date.

When a signal initializes with a promise, it will enhance it with status details. Whenever the promise status details update, so does the signal. That means you can observe data fetching and other asynchronous processes directly in your components. Additionally, the status details added to the promise allow you to suspend the promise using the `use` hook.

```tsx
import { use } from "impact-react";
import { usePostsStore } from "../stores/PostsStore";

function Post(props) {
  using postsStore = usePostsStore();

  const post = use(postsStore.fetchPost(props.id));

  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
    </div>
  );
}
```

But maybe you do not want to use suspense and prefer to deal with the status of the promise directly in the component:

```tsx
import { observer } from "impact-react";
import { usePostsStore } from "../stores/PostsStore";

function Post(props) {
  using postsStore = usePostsStore();

  const postPromise = postsStore.fetchPost(props.id);

  if (postPromise.status === "pending") {
    return <div>Loading...</div>;
  }

  if (postPromise.status === "rejected") {
    return <div>Some error: {postPromise.reason}</div>;
  }

  const post = postPromise.value;

  return <div>{post.title}</div>;
}
```

However, data fetching is not only about getting and displaying data; it is also about mutations. We can use a promise signal to track the state of mutations.

We'll create a store for any Post so that we can manage the complexity of editing a post. Changing its data, also dealing with optimistic updates and reverting.

```ts
import { PostDTO, useApiStore } from "./ApiStore";
import { signal, Signal, useStore, createStoreProvider } from "impact-app";

export const usePostStore = () => useStore(PostStore);
export const PostStoreProvider = createStoreProvider(PostStore);

type Props = {
  post: PostDTO;
};

// We create a store tied to a specific post
function PostStore(props: Props) {
  const apiStore = useApiStore();

  const id = props.post.id;
  // In this implementation the "props.post" can
  // update, but we want to only use the initial title
  // to change it
  const title = signal(initialPost.title);

  // The value of the mutation state starts out as undefined
  const savingTitle = signal<Promise<void> | undefined>(undefined);

  return {
    id,
    get title() {
      return post();
    },
    get savingTitle() {
      return savingTitle();
    },
    changeTitle(newTitle) {
      title(newTitle);

      // If saving the title failed, we'll reset
      // the promise when changing the title again
      if (savingTitle()?.status === "rejected") {
        savingTitle(undefined);
      }
    },
    saveTitle() {
      changingTitle(apiStore.putPost(id, { title: title() }));
    },
  };
}
```

We can now consume this mutation signal to evaluate the state of the mutation declaratively in the component.

```tsx
import { useObserver } from "impact-react";
import { usePostsStore } from "../stores/PostsStore";
import { usePostStore, PostStoreProvider } from "../stores/PostStore";

function PostContent() {
  using _ = useObserver();

  const { title, changeTitle, saveTitle, savingTitle } = usePostStore();

  return (
    <div>
      <input
        // Now we can just check if we have a pending changing title
        disabled={savingTitle?.status === "pending" ?? false}
        value={title}
        onChange={(event) => changeTitle(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "ENTER") {
            saveTitle();
          }
        }}
      />
      {savingTitle?.status === "rejected" ? "Could not update title" : null}
    </div>
  );
}

export function Post({ id }) {
  using _ = useObserver();

  const { fetchPost } = usePostsStore();

  const postData = use(fetchPost(id));

  return (
    // We set a key on the provider to bind the id of a post
    // to the instance of the store
    <PostProvider key={id} post={postData}>
      <PostContent />
    </PostProvider>
  );
}
```
