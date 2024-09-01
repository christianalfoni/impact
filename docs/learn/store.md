# Store

When the React context does not work for us we have a tendency to replace it with global state management. Doing so definitely solves friction, but we also leave something behind. With **impact-react** we rather make the React contexts compatible with the performant and accessible primitives we use for global state management.

**impact-react** implements an observable context we call a store. It is a function with the same mental model as a hook. You return a public interface for components and other stores. The difference is that we are not reconciling. This store function only runs once.

```ts
function AppStore() {
  return {
    message: "Hello World",
  };
}
```

**impact-react** supports several observable primitive. The stores is just a mechanism for you to continue using React context and create a bridge between the world of reconciliation and your observable primitives of choice.

::: code-group

```ts [Impact]
import { createStore, signal } from "impact-react/signals";

function AppStore() {
  const [count, setCount] = signal(0);

  return {
    count,
    increase() {
      setCount((current) => current + 1);
    },
  };
}

export const useAppStore = createStore(AppStore);
```

```ts [Preact]
import { createStore } from "impact-react/preact-signals";
import { signal } from "@preact/signals-core";

function AppStore() {
  const count = signal(0);

  return {
    get count() {
      return count.value;
    },
    increase() {
      count.value++;
    },
  };
}

export const useAppStore = createStore(AppStore);
```

```ts [Mobx (OO)]
import { createStore } from "impact-react/mobx";
import { makeAutoObservable } from "mobx";

class AppStore {
  count = 0;
  increase() {
    this.count++;
  }
}

export const useAppStore = createStore(() =>
  makeAutoObservable(new AppStore()),
);
```

```ts [Mobx]
import { createStore } from "impact-react/mobx";
import { observable, action } from "mobx";

function AppStore() {
  const state = observable({
    count: 0,
  });

  return {
    get count() {
      return state.count;
    },
    increase: action(() {
      state.count++;
    }),
  };
}

export const useAppStore = createStore(AppStore);
```

```ts [LegendApp]
import { createStore } from "impact-react/legendapp";
import { observable } from "@legendapp/state";

function AppStore() {
  const count$ = observable(0);

  return {
    get count() {
      return count$.get();
    },
    increase() {
      count$.update((current) => current + 1);
    },
  };
}

export const useAppStore = createStore(AppStore);
```

:::

The hook returned from `createStore` includes the provider.

```tsx
import { useAppStore } from "./stores/AppStore";

function Counter() {
  const appStore = useAppStore();

  return <div />;
}

function App() {
  return (
    <useAppStore.Provider>
      <Counter />
    </useAppStore.Provider>
  );
}
```
