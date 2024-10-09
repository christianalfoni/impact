# Nested Stores

As **Impact** builds on the existing React context you will be able to instantiate reactive state management related to specific pages, features or even for each item in a list.

The store can receive props from React, just like normal React context providers. The props are received as an object where each prop returns a reactive primitive representing the value of that prop. This is because React can update the props through reconciliation. You can use the props with observing primitives like computed, effect etc. and also expose them from the store itself to be observed in nested components or stores.

The hook returned from `createStore` can be used in both components and other stores.

::: code-group

```ts [Impact Signals]
import { createStore, signal, effect } from "@impact-react/signals";
import { useGlobalStore } from "./GlobalStore";

function AppStore(props, cleanup) {
  // You can use parent stores
  const globalStore = useGlobalStore();

  // The "initialCount" is observable, but we only want to use
  // it as an initial count
  const [count, setCount] = signal(props.initialCount);

  // Accessing the props will observe them
  effect(() => {
    console.log(props.user, props.initialCount);
  });

  return {
    count,
    get user() {
      // We expose access to the "user" on this store as
      // getting the user from the props. That means if
      // React reconciles and updates the "user" passed to this
      // store, any consumer of this store user property will update
      return props.user;
    },
  };
}

export const useAppStore = createStore(AppStore);
```

```ts [Mobx (OO)]
import { createStore } from "@impact-react/mobx";
import { observable, autorun, makeAutoObservable } from "mobx";
import { useGlobalStore } from "./GlobalStore";

class AppStore {
  // The "initialCount" is observable, but we only want to use
  // it as an initial count
  count = this.props.initialCount;
  get user() {
    // We expose access to the "user" on this store as
    // getting the user from the props. That means if
    // React reconciles and updates the "user" passed to this
    // store, any consumer of this store user property will update
    return this.props.user;
  }
  private disposeEffect;
  constructor(
    private globalStore,
    private props,
  ) {
    // Accessing the props will observe them
    autorun(() => {
      console.log(props.user, props.initialCount);
    });
  }
}

export const useAppStore = createStore((props) => {
  // You can use parent stores
  const globalStore = useGlobalStore();

  return makeAutoObservable(new AppStore(globalStore, props));
});
```

```ts [Mobx]
import { createStore } from "@impact-react/mobx";
import { observable, autorun } from "mobx";
import { useGlobalStore } from "./GlobalStore";

function AppStore(props) {
  // You can use parent stores
  const globalStore = useGlobalStore();

  // The "initialCount" is observable, but we only want to use
  // it as an initial count
  const state = observable({
    count: props.initialCount,
  });

  // Accessing the props will observe them
  autorun(() => {
    console.log(props.user, props.initialCount);
  });

  return {
    get count() {
      return state.count;
    },
    get user() {
      // We expose access to the "user" on this store as
      // getting the user from the props. That means if
      // React reconciles and updates the "user" passed to this
      // store, any consumer of this store user property will update
      return props.user;
    },
  };
}

export const useAppStore = createStore(AppStore);
```

```ts [Preact Signals]
import { createStore } from "@impact-react/preact";
import { signal, effect } from "@preact/signals-react";
import { useGlobalStore } from "./GlobalStore";

function AppStore(props) {
  // You can use parent stores
  const globalStore = useGlobalStore();

  // The "initialCount" is observable, but we only want to use
  // it as an initial count
  const count = signal(props.initialCount);

  // Accessing the props will observe them
  effect(() => {
    console.log(props.user, props.initialCount);
  });

  return {
    get count() {
      return count.value;
    },
    get user() {
      // We expose access to the "user" on this store as
      // getting the user from the props. That means if
      // React reconciles and updates the "user" passed to this
      // store, any consumer of this store user property will update
      return props.user;
    },
  };
}

export const useAppStore = createStore(AppStore);
```

```ts [Legend State]
import { createStore } from "@impact-react/legend";
import { observable, observe } from "@legendapp/state";
import { useGlobalStore } from "./GlobalStore";

function AppStore(props) {
  // You can use parent stores
  const globalStore = useGlobalStore();

  // The "initialCount" is observable, but we only want to use
  // it as an initial count
  const count = observable(props.initialCount);

  // Accessing the props will observe them
  observe(() => {
    console.log(props.user, props.initialCount);
  });

  return {
    get count() {
      return count.get();
    },
    get user() {
      // We expose access to the "user" on this store as
      // getting the user from the props. That means if
      // React reconciles and updates the "user" passed to this
      // store, any consumer of this store user property will update
      return props.user;
    },
  };
}

export const useAppStore = createStore(AppStore);
```

:::

In most applications you have state that depends on other state. For example the list of posts depends on the current user. Or the state for editing an item depends on the currently selected item. In global state stores you have to manually manage these dependencies, but with nested state stores this is handled by the very nature of putting state management where it is used.

This is an example of how the `AppStore` depends on the user. If the id of the user changes, the store is remounted by React.

```tsx
function AppStore(props) {
  return {
    get user() {
      return props.user;
    },
  };
}

const useAppStore = createStore(AppStore);

export default function AppView() {
  const { authentication } = useGlobalStore();

  if (authentication.state === "AUTHENTICATING") {
    return <h1>Authenticating...</h1>;
  }

  if (authentication.state !== "UNAUTHENTICATED") {
    return <h1>Please authenticate</h1>;
  }

  const user = authentication.state.user;

  return (
    <useAppStore.Provider key={user.id} user={user}>
      <App />
    </useAppStore.Provider>
  );
}

function App() {
  const { user } = useAppStore();
}
```

Another aspect of this is typing. In a global state store you would likely type your user as `User | null`, cause you do not initially have a user. But most components and state management logic only executes in the context of having a user. As a human developer you know there is a user, but TypeScript does not. This results in turning off [strict null checking](https://www.typescriptlang.org/tsconfig/#strictNullChecks), overriding the type or creating conditionals to make the type checker happy. Nested stores resolves this problem.
