# Shared Context

The interface you return from your reactive contexts will be available to any component and any nested context. But there are times you want to expose an interface only to nested contexts. An example of that could be a **GlobalStore** that creates an instance of your API. You only want the nested contexts to deal with this API, not the components themselves. Unlike Reacts context where each context is unique and public, **Impact** implements a shared private context.

```ts
import { context } from "@impact-react/[*]";

function GlobalStore() {
  const api = createApi();

  context({ api });

  return {};
}

function AppStore() {
  const { api } = context();

  return {};
}
```

Just like the React context, the shared context is also an injection mechanism. It has been simplified though, as all the reactive contexts are the same type of context. That means you can consume values from parent contexts simply using a key. In this example the `api` key is resolved up the reactive context hierarchy to find the nearest match.
