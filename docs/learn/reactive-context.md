# Reactive Context

When the React context does not work for us we have a tendency to replace it with global state management. Doing so definitely solves friction, but we also leave something behind. With **Impact** we rather make the React contexts compatible with the performant and accessible reactive primitives we use for global state management.

**Impact** implements a reactive context. Since these reactive contexts are designed for state management, we just call them **stores**. The store is expressed as a simple function returning the public inteface of the store. It is the same mental model as a hook, but this function only runs once, when the related component tree renders.

```ts
function AppStore() {
  return {
    message: "Hello World",
  };
}
```

**Impact** supports any reactive primitive. The reactive context is just a mechanism to bridge the world of reconciliation and your reactive primitives of choice.

::: code-group

```ts [Impact Signals]
import { createStore, signal } from "@impact-react/signals";

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

```ts [Mobx (OO)]
import { createStore } from "@impact-react/mobx";
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
import { createStore } from "@impact-react/mobx";
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

```ts [Preact Signals]
import { createStore } from "@impact-react/preact";
import { signal } from "@preact/signals-react";

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

```ts [Legend State]
import { createStore } from "@impact-react/legend";
import { observable } from "@legendapp/state";

function AppStore() {
  const count$ = observable(0);

  return {
    get count() {
      return count$.get();
    },
    increase() {
      count$.set((current) => current + 1);
    },
  };
}

export const useAppStore = createStore(AppStore);
```

:::

The hook returned from `createStore` has a `.provider` property to provide the store to a component and any of its nested children as well.

```tsx
import { useAppStore } from "./stores/AppStore";

function Counter() {
  const appStore = useAppStore();

  return <div />;
}

export default useAppStore.provider(function App() {
  const appStore = useAppStore();

  return <Counter />;
});
```

If you are using the [Babel Plugin](../index#automatic-observation) any components consuming a store will automatically observe changes to that store and memo itself for optimal reconciliation.

::: info

The only implementation in these packages is to configure the props with the related reactive primitive. This is an example from **Impact Signals**:

```ts
import { configureStore } from "@impact-react/store";
import { signal } from "./signal";

export const createStore = configureStore((propValue) => {
  const [value, setValue] = signal(propValue);

  return {
    get() {
      return value();
    },
    set(newPropValue) {
      setValue(newPropValue);
    },
  };
});
```

:::
