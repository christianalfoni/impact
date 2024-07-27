# Queries and Mutations

One of the most common things you do in any web application is fetching data from the server and changing data on the server. Under the hood, this is based on promises. The [new use hook](https://blixtdev.com/all-about-reacts-new-use-hook) allows you to consume promises directly in components in combination with suspense and error boundaries. This is great, but managing these promises is not something React is good at or should even consider doing.

There are several data fetching solutions for React, like [react-query](https://tanstack.com/query/v4/docs/react/reference/useQuery) and [swr](https://swr.vercel.app/), which you can use in combination with **Impact**. But you can also choose to use signals.

**Impact** signals is a powerful primitive that makes promises observable and suspendable. This is a lower abstraction than the above mentioned tools, but that makes them flexible and usable for all kinds of async state management, including queries and mutations.

```ts
import { signal, observe } from "impact-react";

// Imagine that we have a posts page where we want to
// fetch and cache any posts we open
export function createPosts() {
  // We cache any queries for posts using a record of the post id
  // with the promise of the post as a signal
  const posts = {};

  return {
    fetchPost(id) {
      let post = posts[id];

      if (!post) {
        // If we have no post, we grab it and store it in a signal
        post = posts[id] = signal(
          fetch("/posts/" + id).then((response) => response.json()),
        );
      }

      // We return the signal value, which is now an observable promise
      return post();
    },
  };
}
```

You choose how this cache operates. In this example, we never invalidate the cache, but you are free to do so at any time. You could also subscribe to the posts to keep them up to date.

When a signal initializes with a promise, it will enhance it with status details. Whenever the promise status details update, so does the signal. That means you can observe data fetching and other asynchronous processes directly in your components. Additionally, the status details added to the promise allow you to suspend the promise using the `use` hook.

```tsx
import { observe } from "impact-react";
import { use } from "react";
import { usePosts } from "./app";

const Post = observe(({ id }) => {
  const posts = usePosts();
  const post = use(posts.fetchPost(id));

  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
    </div>
  );
});
```

But maybe you do not want to use suspense and prefer to deal with the status of the promise directly in the component:

```tsx
import { observe } from "impact-react";
import { usePosts } from "./app";

const Post = observe(({ id }) => {
  const posts = usePosts();
  const postPromise = posts.fetchPost(id);

  if (postPromise.status === "pending") {
    return <div>Loading...</div>;
  }

  if (postPromise.status === "rejected") {
    return <div>Some error: {postPromise.reason}</div>;
  }

  const post = postPromise.value;

  return <div>{post.title}</div>;
});
```

However, data fetching is not only about getting and displaying data; it is also about mutations. We can use a promise signal to track the state of mutations.

We'll create a store for each Post so that we can manage changing its title, also dealing with optimistic updates and reverting.

```ts
import { signal, observe } from "impact-app";

// We create a post with some initial data
function createPost(initialData) {
  const id = initialData.id;
  const title = signal(initialData.title);
  // The value of the mutation state starts out as undefined
  const changingTitle = signal(undefined);

  return {
    id,
    get title() {
      return title();
    },
    changeTitle(newTitle) {
      const oldTitle = title();

      // Optimistically change the title
      title(newTitle);

      // Update the mutation signal with the request
      changingTitle(
        fetch({
          method: "PUT",
          url: "/posts/" + id,
          data: {
            title: newTitle,
          },
        }),
      );

      // Revert to the previous title on error
      changingTitle().catch(() => {
        title(oldTitle);
      });
    },
  };
}
```

We can now consume this mutation signal to evaluate the state of the mutation declaratively in the component.

```tsx
import { usePosts } from "./app";

function Post({ id }) {
  const posts = usePosts();
  const post = use(posts.fetchPost(id));
  const [newTitle, setNewTitle] = useState(post.title);

  return (
    <div>
      <input
        // Now we can just check if we have a pending changing title
        disabled={post.changingTitle?.status === "pending" ?? false}
        value={newTitle}
        onChange={(event) => setNewTitle(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "ENTER") {
            post.changeTitle(id, newTitle);
          }
        }}
      />
      {post.changingTitle?.status === "rejected"
        ? "Could not update title"
        : null}
    </div>
  );
}
```
