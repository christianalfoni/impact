# Queries and Mutations

One of the most common things you do in any web application is fetching data from the server and changing data on the server. Under the hood, this is typically based on promises. The [new use hook](https://blixtdev.com/all-about-reacts-new-use-hook) allows you to consume promises directly in components in combination with suspense and error boundaries. This is great, but managing these promises is not something React is good at or should even consider doing.

There are several data fetching solutions for React, like [react-query](https://tanstack.com/query/v4/docs/react/reference/useQuery) and [swr](https://swr.vercel.app/), which you can use in combination with **Impact**. But you can also choose to use signals.

**Impact** signals is a powerful primitive that makes promises observable and suspendable. This is a lower abstraction than the above mentioned tools, but that makes them flexible and usable for all kinds of async state management, including queries and mutations.

```ts
import { signal, createStore } from "impact-react";
import { useGlobalStore, PostDTO } from "./GlobalStore";

export type PostDTOUpdate = Partial<Omit<PostDTO, "id">>;

export const usePostsStore = createStore(PostsStore);

// Imagine that we have a posts page where we want to
// fetch and cache any posts we open
function PostsStore() {
  const { api } = useGlobalStore();

  // We cache any queries for posts using a record of the post id
  // with the promise of the post as a signal
  const posts: Record<string, Signal<Promise<PostDTO>>> = {};

  return {
    fetchPost(id: string) {
      let postSignal = posts[id];

      if (!postSignal) {
        postSignal = posts[id] = signal(fetchPost(id));
      }

      const [post] = postSignal;

      return post;
    },
    async updatePost(id: string, update: PostDTOUpdate) {
      const [post, setPost] = posts[id];
      // The post is a promise, so we first await the current post
      const currentPost = await post();

      // We run the request to update the post
      const updatePost = api.putPost(id, update);

      setPost(
        // We set the new post using the "updatePost" request so that any
        // simultanious update will wait for this to finish
        updatePost
          .then(() => ({
            // We update it when it is done
            ...currentPost,
            ...update,
          }))
          // Or keep the current post if it fails
          .catch(() => currentPost),
      );

      // We return the promise of updating the post on the server
      // to handle any rejection where the update was requested
      return updatePost;
    },
  };

  async function fetchPost(id): PostDTO {
    const response = await fetch("/posts/" + id);

    return response.json();
  }
}
```

You choose how this cache operates. In this example, we never invalidate the cache, but you are free to do so at any time. You could also subscribe to the posts to keep them up to date.

When a signal initializes with a promise, it will enhance it with status details. Whenever the promise status details update, so does the signal. That means you can observe data fetching and other asynchronous processes directly in your components. Additionally, the status details added to the promise allow you to suspend the promise using the `use` hook.

```tsx
import { use, useObserver } from "impact-react";
import { usePostsStore } from "../stores/PostsStore";

function Post(props) {
  using _ = useObserver();

  const { fetchPost } = usePostsStore();
  const postPromise = fetchPost(props.id);
  const post = use(postPromise());

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
import { useObserver } from "impact-react";
import { usePostsStore } from "../stores/PostsStore";

function Post(props) {
  using _ = useObserver();

  const { fetchPost } = usePostsStore();
  const postPromise = fetchPost(props.id);
  const currentPostPromise = postPromise();

  if (currentPostPromise.status === "pending") {
    return <div>Loading...</div>;
  }

  if (currentPostPromise.status === "rejected") {
    return <div>Some error: {currentPostPromise.reason}</div>;
  }

  const post = currentPostPromise.value;

  return <div>{post.title}</div>;
}
```

However, data fetching is not only about getting and displaying data; it is also about mutations. We can use a promise signal to track the state of mutations.

We'll create a store for any Post so that we can manage the complexity of editing a post.

```ts
import { PostDTO } from "./GlobalStore";
import { usePostsStore } from "./PostsStore";
import { signal, createStore } from "impact-app";

export const usePostStore = createStore(PostStore);

type Props = {
  post: () => PostDTO;
};

// We create a store tied to a specific post
function PostStore(props: Props) {
  const { updatePost } = usePostsStore();

  const post = props.post();
  const id = post.id;

  const [title, setTitle] = signal(post.title);
  const [savingTitle, setSavingTitle] = signal<Promise<void> | undefined>(
    undefined,
  );

  return {
    id,
    title,
    savingTitle,
    changeTitle(newTitle) {
      setTitle(newTitle);

      // If saving the title failed, we'll reset
      // the promise signal when changing the title again
      if (savingTitle()?.status === "rejected") {
        setSavingTitle(undefined);
      }
    },
    saveTitle() {
      // If for some reason we save again while pending, the previous promise
      // is automatically aborted
      setSavingTitle(updatePost(id, { title: title() }));
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
        disabled={savingTitle()?.status === "pending" ?? false}
        value={title()}
        onChange={(event) => changeTitle(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "ENTER") {
            saveTitle();
          }
        }}
      />
      {savingTitle()?.status === "rejected" ? "Could not update title" : null}
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
