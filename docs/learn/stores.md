# Stores

A common name for encapsulation of state management is **stores**. With **Impact** you can think about the reactive context as initializing a store. In this article are some recommendations regardless of what reactive primitives you use.

## Constructing stores

Define your store much like a hook, returning an interface to interact with state management instead of UI.

```ts
function AppStore() {
  return {};
}
```

When defining state it is good practice to expose that state as `readonly`.

::: code-group

```ts [Impact Signals]
import { signal } from "@impact-react/signals";

function AppStore() {
  const [count, setCount] = signal(0);

  return {
    count,
    increase() {
      setCount((current) => current + 1);
    },
  };
}
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
  // "makeAutoObservable" makes methods into actions, where
  // any change to observables outside actions throws a warning
  makeAutoObservable(new AppStore()),
);
```

```ts [Mobx]
import { observable, action } from "mobx";

function AppStore() {
  const state = observable({
    count: 0,
  });

  return {
    get count() {
      return state.count;
    },
    increase: action(() => {
      state.count++;
    }),
  };
}
```

```ts [Preact Signals]
import { signal } from "@preactjs/signals-core";

function AppStore() {
  const count = signal(0);

  return {
    get count() {
      return count.value;
    },
    increase() {
      state.value++;
    },
  };
}
```

```ts [Legend State]
import { observable } from "@legendapp/state";

function AppStore() {
  const count = observable(0);

  return {
    get count() {
      return count.get();
    },
    increase() {
      count.set((current) => current + 1);
    },
  };
}
```

:::

Define any private functions _after_ the return statement. This increases readability of the store as its key features are at the top.

::: code-group

```ts [Impact Signals]
import { signal } from "@impact-react/signals";

function AppStore() {
  const [count, setCount] = signal(0);

  return {
    count,
    increase,
  };

  function increase() {
    setCount((current) => current + 1);
  }
}
```

```ts [Mobx (OO)]
// Does not really apply here
```

```ts [Mobx]
import { observable, action } from "mobx";

function AppStore() {
  const state = observable({
    count: 0,
  });

  return {
    get count() {
      return state.count;
    },
    increase: action(increase),
  };

  function increase() {
    state.count++;
  }
}
```

```ts [Preact Signals]
import { signal } from "@preactjs/signals-core";

function AppStore() {
  const count = signal(0);

  return {
    get count() {
      return count.value;
    },
    increase,
  };

  function increase() {
    state.value++;
  }
}
```

```ts [Legend State]
import { observable } from "@legendapp/state";

function AppStore() {
  const count = observable(0);

  return {
    get count() {
      return count.get();
    },
    increase,
  };

  function increase() {
    count.set((current) => current + 1);
  }
}
```

:::

Compose the store using additional functions which you call during instantiation of the store. As they are called during instantiation, they can also consume parent stores, do cleanups etc.

::: code-group

```ts [Impact Signals]
import { createReactiveContext, signal } from "@impact-react/signals";

function AppStore() {
  const counter = createCounter();

  return {
    counter,
  };
}

function createCounter() {
  const [count, setCount] = signal(0);

  return {
    count,
    increase,
  };

  function increase() {
    setCount((current) => current + 1);
  }
}

export const useAppStore = createReactiveContext(AppStore);
```

```ts [Mobx (OO)]
import { createReactiveContext } from "@impact-react/mobx";
import { makeAutoObservable } from "mobx";

class AppStore {
  counter = new Counter();
}

class Counter {
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
  const counter = createCounter();

  return {
    counter,
  };
}

function createCounter() {
  const state = observable({
    count: 0,
  });

  return {
    get count() {
      return state.count;
    },
    increase: action(increase),
  };

  function increase() {
    setCount((current) => current + 1);
  }
}

export const useAppStore = createReactiveContext(AppStore);
```

```ts [Preact Signals]
import { createReactiveContext } from "@impact-react/preact";
import { signal } from "@preactjs/signals-core";

function AppStore() {
  const counter = createCounter();

  return {
    counter,
  };
}

function createCounter() {
  const count = signal(0);

  return {
    get count() {
      return count.value;
    },
    increase,
  };

  function increase() {
    count.value++;
  }
}

export const useAppStore = createReactiveContext(AppStore);
```

```ts [Legend State]
import { createReactiveContext } from "@impact-react/legend";
import { observable } from "@legendapp/state";

function AppStore() {
  const counter = createCounter();

  return {
    counter,
  };
}

function createCounter() {
  const count = observable(0);

  return {
    get count() {
      return count.get();
    },
    increase,
  };

  function increase() {
    count.set((current) => current + 1);
  }
}

export const useAppStore = createReactiveContext(AppStore);
```

:::

There are no limits to how big your stores can be in terms of performance. How you choose to integrate logic into existing stores or create new stores is up to you.

## Props

Stores can receive props. These props becomes observable values inside the store. When React reconciles and updates the prop, the corresponding observable will update its value and trigger observation.

Given the following mounting of a store:

```tsx
type Props = { user?: UserDTO };

function App(props) {
  return (
    <useAppStore.Provider user={props.user} initialCount={10}>
      <SomeAppFeature />
    </useAppStore.Provider>
  );
}
```

Let us see how we can use these props:

::: code-group

```ts [Impact Signals]
import {
  createReactiveContext,
  cleanup,
  signal,
  derived,
  effect,
} from "@impact-react/signals";

type StoreProps = {
  // Do not use optional props, but rather undefined
  user: UserDTO | undefined;
  initialCount: number;
};

function AppStore(props: StoreProps) {
  // Use as an initial value
  const [count, setCount] = signal(props.initialCount);

  // If the user prop changes, you can derive from it when
  // it changes
  const isAwesome = derived(() => props.user?.isAwesome ?? false);

  // The same goes for effects

  effect(() => {
    if (props.user?.isAwesome) {
      alert("Good for you!");
    }
  });

  return {
    // You can just expose it to nested
    // components and stores
    get user() {
      return props.user;
    },
  };
}

const useAppStore = createStore(AppStore);
```

```ts [Mobx (OO)]
import { createReactiveContext, cleanup } from "@impact-react/mobx";
import { autorun, makeAutoObservable } from "mobx";

type StoreProps = {
  // Do not use optional props, but rather undefined
  user: UserDTO | undefined;
  initialCount: number;
};

class AppStore {
  // Use as an initial value
  count = this.props.initialCount;
  // If the user prop changes, you can derive from it when
  // it changes
  get isAwesome() {
    return this.props.user?.isAwesome ?? false;
  }
  get user() {
    // You can just expose it to nested
    // components and stores
    return this.props.user;
  }
  private disposeEffect: () => void;
  constructor(private props: StoreProps) {
    // Observe the changes using autorun or reaction
    this.disposeEffect = autorun(() => {
      if (props.user?.isAwesome) {
        alert("Good for you!");
      }
    });
  }
  dispose() {
    this.disposeEffect();
  }
}

const useAppStore = createStore((props: StoreProps) => {
  const appStore = new AppStore(props);

  cleanup(() => appStore.dispose());

  return appStore;
});
```

```ts [Mobx]
import { createReactiveContext, cleanup } from "@impact-react/mobx";
import { autorun, observable, computed } from "mobx";

type StoreProps = {
  // Do not use optional props, but rather undefined
  user: UserDTO | undefined;
  initialCount: number;
};

function AppStore(props: StoreProps) {
  // Use as an initial value
  const state = observable({
    count: props.initialCount,
  });

  // If the user prop changes, you can derive from it when
  // it changes
  const isAwesome = computed(() => props.user?.isAwesome ?? false);

  // The same goes for effects
  cleanup(
    autorun(() => {
      if (props.user?.isAwesome) {
        alert("Good for you!");
      }
    }),
  );

  return {
    // You can just expose it to nested
    // components and stores
    get user() {
      return props.user;
    },
  };
}

const useAppStore = createStore(AppStore);
```

```ts [Preact Signals]
import { createReactiveContext, cleanup } from "@impact-react/preact";
import { signal, computed, effect } from "@preactjs/signals-core";

type StoreProps = {
  // Do not use optional props, but rather undefined
  user: UserDTO | undefined;
  initialCount: number;
};

function AppStore(props: StoreProps) {
  // Use as an initial value
  const count = signal(props.initialCount);

  // If the user prop changes, you can derive from it when
  // it changes
  const isAwesome = computed(() => props.user?.isAwesome ?? false);

  // The same goes for effects

  cleanup(
    effect(() => {
      if (props.user?.isAwesome) {
        alert("Good for you!");
      }
    }),
  );

  return {
    // You can just expose it to nested
    // components and stores
    get user() {
      return props.user;
    },
  };
}

const useAppStore = createStore(AppStore);
```

```ts [Legend State]
import { createReactiveContext, cleanup } from "@impact-react/legend";
import { observable, observer } from "@legendapp/state";

type StoreProps = {
  // Do not use optional props, but rather undefined
  user: UserDTO | undefined;
  initialCount: number;
};

function AppStore(props: StoreProps) {
  // Use as an initial value
  const count$ = observable(props.initialCount);

  // If the user prop changes, you can derive from it when
  // it changes
  const isAwesome$ = observable(() => props.user?.isAwesome ?? false);

  // The same goes for effects
  cleanup(
    observer(() => {
      if (props.user?.isAwesome) {
        alert("Good for you!");
      }
    }),
  );

  return {
    // You can just expose it to nested
    // components and stores
    get user() {
      return props.user;
    },
  };
}

const useAppStore = createStore(AppStore);
```

:::
