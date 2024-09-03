# Nested Contexts

As **impact-react** builds on the existing React context you will be able to instantiate state management related to specific pages, features or even for each item in a list.

The store can receive props from React. This props object has a `getter` for each prop which returns an observable primitive for that prop. This is because React might update the props through reconciliation. You can use the props with observing primitives like computed, effect etc. and also expose them from the context to be used in nested components or contexts.

The hook returned from `createObservableContext` can be used in both components and other contexts, both React contexts and observable contexts.

::: code-group

```ts [Impact]
import {
  createObservableContext,
  cleanup,
  signal,
  effect,
} from "impact-react-signals";
import { useGlobalStore } from "./GlobalStore";

function AppStore(props) {
  // You can use parent observable contexts
  const globalStore = useGlobalStore();

  // The "initialCount" is observable, but we only want to use
  // it as an initial count
  const [count, setCount] = signal(props.initialCount);

  // Accessing the props will observe them. This effect
  // will automatically cleanup
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

export const useAppStore = createObservableContext(AppStore);
```

```ts [Mobx]
import { cleanup, createObservableContext } from "impact-react-mobx";
import { observable, autorun } from "mobx";
import { useGlobalStore } from "./GlobalStore";

class AppStore {
  // You can use parent observable contexts
  private globalStore = useGlobalStore();
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
  constructor(private props) {
    // Accessing the props will observe them
    cleanup(
      autorun(() => {
        console.log(props.user, props.initialCount);
      }),
    );
  }
}

export const useAppStore = createObservableContext((props) =>
  makeAutoObservable(new AppStore(props)),
);
```

```ts [Mobx]
import { cleanup } from "impact-react-mobx";
import { observable, autorun } from "mobx";
import { useGlobalStore } from "./GlobalStore";

function AppStore(props) {
  // You can use parent observable contexts
  const globalStore = useGlobalStore();

  // The "initialCount" is observable, but we only want to use
  // it as an initial count
  const state = observable({
    count: props.initialCount,
  });

  // Accessing the props will observe them
  cleanup(
    autorun(() => {
      console.log(props.user, props.initialCount);
    }),
  );

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

export const useAppStore = createObservableContext(AppStore);
```

```ts [Preact]
import { cleanup } from "impact-react-preact";
import { signal, effect } from "@preact/signals-react";
import { useGlobalStore } from "./GlobalStore";

function AppStore(props) {
  // You can use parent observable contexts
  const globalStore = useGlobalStore();

  // The "initialCount" is observable, but we only want to use
  // it as an initial count
  const count = signal(props.initialCount);

  // Accessing the props will observe them
  cleanup(
    effect(() => {
      console.log(props.user, props.initialCount);
    }),
  );

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

export const useAppStore = createObservableContext(AppStore);
```

```ts [Legend State]
import { cleanup } from "impact-react-legendapp";
import { observable, observe } from "@legendapp/state";
import { useGlobalStore } from "./GlobalStore";

function AppStore(props) {
  // You can use parent observable contexts
  const globalStore = useGlobalStore();

  // The "initialCount" is observable, but we only want to use
  // it as an initial count
  const count = observable(props.initialCount);

  // Accessing the props will observe them
  cleanup(
    observe(() => {
      console.log(props.user, props.initialCount);
    }),
  );

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

export const useAppStore = createObservableContext(AppStore);
```

:::

::: tip

Another aspect of scoping state management is related to typing. Global state management typically defines `null` values for uninitialized state. With [strict null checking](https://www.typescriptlang.org/tsconfig/strictNullChecks.html) enabled you are likely to find your code having many non functional `if` statements to please the type checker. This does not happen with **impact-react** because a context is only initialized when its dependent state is available, passed as props.

:::
