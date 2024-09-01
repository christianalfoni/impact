# Nested Stores

As **impact-react** builds on the existing React context you will be able to instantiate state management related to specific pages, features or even for each item in a list.

The store can receive props from React. These props are received as the configured observable primitive. This is because React might update the props through reconciliation. You can use the props at any time inside the store and also expose them from the store to be used in nested components or stores.

```ts
import { cleanup } from "impact-react";
import { createStore } from "./store";
import { observable, autorun } from "mobx";

export const useAppStore = createStore(AppStore);

function AppStore(props) {
  const state = observable({
    // The "initialCount" is observable, but we only want to use
    // it as an initial count
    count: props.initialCount,
  });

  cleanup(
    // Accessing the props will observe them
    autorun(() => {
      console.log(props.user, props.initialCount);
    }),
  );

  return {
    count,
    get user() {
      // We expose access to the "user" on this store as
      // getting the user from the props. That means if
      // React reconciles and updates the "user" passed to this
      // store, any consumer of this store user will update
      return props.user;
    },
  };
}
```

The provided store can be consumed from nested components, but also other nested stores. Think of the stores as traditional React context behaviour, but with primitives improving performance and developer experience.

The hook returned from `createStore` is not only available for usage in components. You can also use them inside nested stores.

::: tip

Another aspect of scoping state management is related to typing. Global state management typically defines `null` values for uninitialized state. With [strict null checking](https://www.typescriptlang.org/tsconfig/strictNullChecks.html) enabled you are likely to find your code having many non functional `if` statements to please the type checker. This does not happen with **impact-react** because a store is only initialized when its dependent state is available.

:::
