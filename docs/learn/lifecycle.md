# Lifecycle

React has two mounting phases. The _render_ phase and the _commit_ phase. The stores are by default instantiated during the _render_ phase. Because of Reacts concurrent mode components might not reach the next phase, the _commit_ phase. That means if you create a side effect during the _render_ phase and it does not reach the _commit_ phase, there is no hook execution to clean it up. With **Impact** we allow you to write code as you are used to in any other domain. That means side effects can be created during the instantiation of the store and be cleaned up reliably. **Impact** stores are concurrent safe.

When you have a side effect you can clean that up using the `cleanup` function. When this cleanup is used by your store Impact will instantiate the store in the _commit_ phase. This guarantees that the component will be mounted and later unmounted, running the `cleanup`.

::: code-group

```ts [Impact Signals]
import { createStore, signal } from "@impact-react/signals";

function AppStore(props, cleanup) {
  const [count, setCount] = signal(0);

  const interval = setInterval(() => {
    setCount((current) => current + 1);
  }, 1000);

  cleanup(() => clearInterval(interval));

  return {
    count,
  };
}

export const useAppStore = createStore(AppStore);
```

```ts [Mobx (OO)]
import { createStore, cleanup } from "@impact-react/mobx";
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

export function useAppStore = createStore(() => {
  const appStore = makeAutoObservable(new AppStore())

  cleanup(() => appStore.dispose())

  return appStore
})
```

```ts [Mobx]
import { createStore } from "@impact-react/mobx";
import { observable } from "mobx";

function AppStore(props, cleanup) {
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

export const useAppStore = createStore(AppStore);
```

```ts [Preact Signals]
import { createStore } from "@impact-react/preact";
import { signal } from "@preact/signals-react";

function AppStore(props, cleanup) {
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

export const useAppStore = createStore(AppStore);
```

```ts [Legend State]
import { createStore } from "@impact-react/legend";
import { observable } from "@legendapp/state";

function AppStore(props, cleanup) {
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

export const useAppStore = createStore(AppStore);
```

:::

Since our store is just a function scope, we are free to do state management beyond just the state we expose to components. In this case we run an interval for as long as the `AppStore` is mounted. But this could have been a subscription or some instance you need to dispose of when the store unmounts.

You can force a store to remount by using the `key` property on the component providing it. For example you can use the `id` of a user to ensure that all state management related to the current user will be disposed.

::: info
With `StrictMode` your store will still initialise twice, also when initialising in the _commit_ phase. This helps verify that your `cleanup` indeed does what it is supposed to do.
:::
