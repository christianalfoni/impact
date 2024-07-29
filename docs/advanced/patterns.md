# Patterns

## Constructing the application

It is recommended to use functions to construct your application. It is possible to use classes though:

```ts
import { signal } from "impact-react";

class App {
  #count = signal(0);
  get count() {
    return this.#count();
  }
  increase() {
    this.#count((current) => current + 1);
  }
}
```

But there is nothing you can do in a class that you can not do in a function:

```ts
import { signal } from "impact-react";

function createApp() {
  const count = signal(0);

  return {
    get count() {
      return count();
    },
    increase() {
      count((current) => current + 1);
    },
  };
}
```

You are free to use classes instead of functions, but as you see it is less verbose and it is a paradigm closer to component functions.

To extend your application you simply define more `create` functions (or classes):

```ts
import { signal } from "impact-react";

function createConfig() {
  return {};
}

function createApp() {
  const count = signal(0);
  const config = createConfig();

  return {
    get count() {
      return count();
    },
    increase() {
      count((current) => current + 1);
    },
  };
}
```

You are free to pass any number of parameters and you can dynamically call `create` functions whenever needed.

To create a type for a `create` function, simply do this:

```ts
export type Admin = ReturnType<typeof createAdmin>;

function createAdmin() {
  return {};
}
```

## Private functions

JavaScript has a feature called [function hoisting](https://developer.mozilla.org/en-US/docs/Glossary/Hoisting), but it is not common knowledge that you can define functions after the return statement of a function.

```ts
import { signal } from "impact-react";

function createApp() {
  const count = signal(0);

  return {
    get count() {
      return count();
    },
    increase() {
      updateCount();
    },
  };

  function updateCount() {
    count((current) => current + 1);
  }
}
```

Defining your private functions after the `return` statement is a good way to emphasize what this part of the application is all about and what it exposes. The private functions are smaller less important details.

## Passing dependencies

Your application is likely to have some common utilities for data fetching etc. These utilities needs to be passed through the application where they are needed.

```ts
function createApp() {
  const api = createApi();
  const admin = createAdmin(api);

  return {};
}
```

Just like props passing in React, this can be somewhat tedious. With classes you can take advantage of [dependency injection](https://dev.to/ruben_alapont/the-power-of-dependency-injection-in-typescript-3m5e) and there are similar concepts for functions, but it is discouraged. If you have multiple dependencies, you can rather combine them in a `utils` object etc. and pass that around.

## Lazy loading

You can make the `create` functions async. Calling them returns a promise you can combine with the `use` hook. If you want a fully observable promise, you can wrap the promise in a `signal`.

```tsx
import { use } from "react";
import { signal, observer } from "impact-react";

async function createPost(id) {
  const data = await fetch("/posts/" + id);
  const title = signal(data.title);

  return {
    id,
    get title() {
      return title();
    },
    changeTitle(newTitle) {
      title(newTitle);
    },
  };
}

function createPosts() {
  const posts = {};

  return {
    getPost(id) {
      let post = posts[id];

      if (!post) {
        post = posts[id] = createPost(id);
      }

      return post;
    },
  };
}

const posts = createPosts();

const Post = observer(({ id }) => {
  const post = use(posts.getPost(id));

  return (
    <div>
      <h1>{post.title}</h1>
    </div>
  );
});
```

## Context providers

Even though it is perfectly fine to instantiate your application and consume it directly in components it can be a good idea to use a context provider. This allows you to lazily load component trees and not have a hard dependency to the application itself.

```tsx
export const context = createContext(null);

export function AppProvider({ app, children }) {
  return <context.Provider app={app}>{children}</context.Provider>;
}

export const useApp = () => useContext(context);
```

```tsx
import { createApp } from "./app";
import { AppProvider } from "./context";

const app = createApp();

export function App() {
  return (
    <AppProvider app={app}>
      <TheRestOfTheApp />
    </AppProvider>
  );
}
```
