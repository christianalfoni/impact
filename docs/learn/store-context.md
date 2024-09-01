# Store Context

The interface you return from your store will be available to any component and any nested store. This is because it will be exposed on the React context. But there are times you want to expose an interface only to nested stores. An example of that could be a **GlobalStore** that creates an instance of your API. You only want the stores to deal with this API, not the components themselves. That is why **impact-react** enables stores to expose values on its own store context.

```ts
import { context } from "impact-react";

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

Just like the React context, the store context is also an injection mechanism. It has been simplified though, as the store context is only about stores. There is only one store context and you consume values from parent stores simply using a key. In this example the `api` key is resolved up the store hierarchy to find the closest match.
