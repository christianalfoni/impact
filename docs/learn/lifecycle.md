# Lifecycle

React has two mounting phases. The _render_ phase and the _commit_ phase. The observable contexts are instantiated during the _render_ phase as they expose state consumed by the components. When the _commit_ phase has been performed and the components has been mounted, the provider for the observable context can unmount.

**impact-react** allows you to intercept when its related Provider component unmounts. This is called `cleanup`.

```ts
import { cleanup } from "impact-react";

function AppStore() {
  const state = observable({
    count: 0,
  });

  const interval = setInterval(() => {
    state.count++;
  }, 1000);

  cleanup(() => clearInterval(interval));

  return {
    get count() {
      return state.count;
    },
  };
}
```

Since our observable context is just a function scope, we are free to do state management beyond just the state we expose to components. In this case we run an interval for as long as the `AppStore` is mounted. But this could have been a subscription or some instance you need to dispose of when the store unmounts.

You can force an observable context to remount by using the `key` property on the provider. For example you can use the `id` of a user to ensure that all state management related to the current user will be disposed.

Consider including a `Suspense` and `Error` boundary when providing a store. This ensures that the store stays instantiated when using the `use` hook or an error occurs during the _render_ phase.

::: info

There are two scenarios where React starts the _render_ phase, initialising the store, but might dispose the component tree before going to the _commit_ phase.

1. **If a nested component during its render phase throws an error**. In this scenario the store catches the error, cleans up and throws the error up the component tree. This allows any parent error boundary to re-render the component tree and the store is initialised again. It is recommended that you add your own error boundary as a nested component of the store provider.

2. **If a nested component during its render phase throws a promise**. The store Provider includes a Suspense boundary that catches the thrown promise and throws an error that you need to add your own suspense boundary. The reason for this is that React does not provide any mechanism to know when a component tree is disposed before the _commit_ phase. In other words, there is a risk of disposing the store provider without running its cleanup.

:::
