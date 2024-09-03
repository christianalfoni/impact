# Reactive Context

When the React context does not work for us we have a tendency to replace it with global state management. Doing so definitely solves friction, but we also leave something behind. With **Impact** we rather make the React contexts compatible with the performant and accessible reactive primitives we use for global state management.

**Impact** implements a reactive context. We express this context as a function. It is the same mental model as a hook. You return a public interface for components and other reactive contexts. The difference is that we are not reconciling. This function only runs once.

```ts
function AppStore() {
  return {
    message: "Hello World",
  };
}
```

**Impact** supports any reactive primitive. The reactive context is just a mechanism to bridge the world of reconciliation and your reactive primitives of choice. To get going quickly **Impact** provides packages for the most popular solutions.

::: code-group

```ts [Impact Signals]
import { createReactiveContext, signal } from "@impact-react/signals";

function AppStore() {
  const [count, setCount] = signal(0);

  return {
    count,
    increase() {
      setCount((current) => current + 1);
    },
  };
}

export const useAppStore = createReactiveContext(AppStore);
```

```ts [Mobx (OO)]
import { createReactiveContext } from "@impact-react/mobx";
import { makeAutoObservable } from "mobx";

class AppStore {
  count = 0;
  increase() {
    this.count++;
  }
}

export const useAppStore = createReactiveContext(() =>
  makeAutoObservable(new AppStore()),
);
```

```ts [Mobx]
import { createReactiveContext } from "@impact-react/mobx";
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

export const useAppStore = createReactiveContext(AppStore);
```

```ts [Preact Signals]
import { createReactiveContext } from "@impact-react/preact";
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

export const useAppStore = createReactiveContext(AppStore);
```

```ts [Legend State]
import { createReactiveContext } from "@impact-react/legend";
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

export const useAppStore = createReactiveContext(AppStore);
```

:::

The hook returned from `createReactiveContext` has a `.Provider` property to provide the context.

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

::: info

The only implementation in these packages is to configure the props with the related reactive primitive. This is an example from **Impact Signals**:

```ts
import { configureReactiveContext } from "@impact-react/reactive-context";
import { signal } from "./signal";

export const createReactiveContext = configureReactiveContext((propValue) => {
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
