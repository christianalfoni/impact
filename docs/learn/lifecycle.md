# Lifecycle

React has two mounting phases. The _render_ phase and the _commit_ phase. The reactive contexts are instantiated during the _render_ phase as they expose state consumed by the components. When the _commit_ phase has been performed and the components has been mounted, the provider for the reactive context can unmount.

**Impact** allows you to intercept when its related Provider component unmounts. This is called `cleanup`.

::: code-group

```ts [Impact Signals]
import { createReactiveContext, cleanup, signal } from "@impact-react/signals";

function AppStore() {
  const [count, setCount] = signal(0);

  const interval = setInterval(() => {
    setCount((current) => current + 1);
  }, 1000);

  cleanup(() => clearInterval(interval));

  return {
    count,
  };
}

export const useAppStore = createReactiveContext(AppStore);
```

```ts [Mobx (OO)]
import { createReactiveContext, cleanup } from "@impact-react/mobx";
import { makeAutoObservable } from "mobx";

class AppStore {
  count = 0;
  interval = setInterval(() => {
    this.count++;
  });
  dispose() {
    clearInterval(this.interval);
  }
}

export function useAppStore = createReactiveContext(() => {
  const appStore = makeAutoObservable(new AppStore())

  cleanup(() => appStore.dispose())

  return appStore
})
```

```ts [Mobx]
import { createReactiveContext, cleanup } from "@impact-react/mobx";
import { observable } from "mobx";

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

export const useAppStore = createReactiveContext(AppStore);
```

```ts [Preact Signals]
import { createReactiveContext, cleanup } from "@impact-react/preact";
import { signal } from "@preact/signals-react";

function AppStore() {
  const count = signal(0);

  const interval = setInterval(() => {
    count.value++;
  }, 1000);

  cleanup(() => clearInterval(interval));

  return {
    get count() {
      return count.value;
    },
  };
}

export const useAppStore = createReactiveContext(AppStore);
```

```ts [Legend State]
import { createReactiveContext, cleanup } from "@impact-react/legend";
import { observable } from "@legendapp/state";

function AppStore() {
  const count = observable(0);

  const interval = setInterval(() => {
    count.set((current) => current + 1);
  }, 1000);

  cleanup(() => clearInterval(interval));

  return {
    get count() {
      return count.get();
    },
  };
}

export const useAppStore = createReactiveContext(AppStore);
```

:::

Since our reactive context is just a function scope, we are free to do state management beyond just the state we expose to components. In this case we run an interval for as long as the `AppStore` is mounted. But this could have been a subscription or some instance you need to dispose of when the store unmounts.

You can force a reactive context to remount by using the `key` property on the provider. For example you can use the `id` of a user to ensure that all state management related to the current user will be disposed.

Consider including a `Suspense` and `Error` boundary when providing a reactive context. This ensures that the context stays instantiated when using the `use` hook or an error occurs during the _render_ phase.

::: info

There are two scenarios where React starts the _render_ phase, initialising the reactive context, but might dispose the component tree before going to the _commit_ phase.

1. **If a nested component during its render phase throws an error**. In this scenario the reactive context provider catches the error, cleans up and throws the error up the component tree. This allows any parent error boundary to re-render the component tree and the reactive context is initialised again. It is recommended that you add your own error boundary as a nested component of the observable context provider.

2. **If a nested component during its render phase throws a promise**. The reactive context provider includes a Suspense boundary that catches the thrown promise and throws an error warning that you need to add your own suspense boundary. The reason for this is that React does not provide any mechanism to know when a component tree is disposed before the _commit_ phase. In other words, there would be a risk while suspending where the user changes the state of the application and the reactive context provider would not run its cleanup.

:::
