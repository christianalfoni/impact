# Nested State Management

As **Impact** builds on the existing React context you will be able to instantiate state management related to specific pages, features or even for each item in a list.

The reactive context provider can receive props from React, just like normal React context providers. The props are received as an object where each prop returns a reactive primitive representing the value of that prop. This is because React can update the props through reconciliation. You can use the props with observing primitives like computed, effect etc. and also expose them from the reactive context itself to be used in nested components or contexts.

The hook returned from `createReactiveContext` can be used in both components and other contexts.

::: code-group

```ts [Impact Signals]
import {
  createReactiveContext,
  cleanup,
  signal,
  effect,
} from "@impact-react/signals";
import { useGlobalStore } from "./GlobalStore";

function AppStore(props) {
  // You can use parent reactive contexts
  const globalStore = useGlobalStore();

  // The "initialCount" is observable, but we only want to use
  // it as an initial count
  const [count, setCount] = signal(props.initialCount);

  // Accessing the props will observe them. Impact Signals effect
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

export const useAppStore = createReactiveContext(AppStore);
```

```ts [Mobx (OO)]
import { cleanup, createReactiveContext } from "@impact-react/mobx";
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
    disposeEffect = autorun(() => {
      console.log(props.user, props.initialCount);
    });
  }
  dispose() {
    this.disposeEffect();
  }
}

export const useAppStore = createReactiveContext((props) => {
  // You can use parent reactive contexts
  const globalStore = useGlobalStore();
  const appStore = makeAutoObservable(new AppStore(globalStore, props));

  cleanup(() => appStore.dispose());

  return appStore;
});
```

```ts [Mobx]
import { cleanup, createReactiveContext } from "@impact-react/mobx";
import { observable, autorun } from "mobx";
import { useGlobalStore } from "./GlobalStore";

function AppStore(props) {
  // You can use parent reactive contexts
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

export const useAppStore = createReactiveContext(AppStore);
```

```ts [Preact Signals]
import { cleanup, createReactiveContext } from "@impact-react/preact";
import { signal, effect } from "@preact/signals-react";
import { useGlobalStore } from "./GlobalStore";

function AppStore(props) {
  // You can use parent reactive contexts
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

export const useAppStore = createReactiveContext(AppStore);
```

```ts [Legend State]
import { cleanup, createReactiveContext } from "@impact-react/legend";
import { observable, observe } from "@legendapp/state";
import { useGlobalStore } from "./GlobalStore";

function AppStore(props) {
  // You can use parent reactive contexts
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

export const useAppStore = createReactiveContext(AppStore);
```

:::

::: tip

Another aspect of nested state management is related to typing. Global state management typically defines `null` values for uninitialized state. With [strict null checking](https://www.typescriptlang.org/tsconfig/strictNullChecks.html) enabled you are likely to find your code having many non functional `if` statements to please the type checker. This does not happen with **Impact** because a context is only initialized when its dependent state is available, passed as props.

:::
