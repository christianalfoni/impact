# Store Lifecycle

React has two mounting phases. The _render_ phase and the _commit_ phase. The stores are by default instantiated during the _render_ phase. Because of Reacts concurrent mode components might not reach the next phase, the _commit_ phase. That means if you create a side effect during the _render_ phase and it does not reach the _commit_ phase, there is no hook execution to clean it up. **Impact** stores are concurrent safe. That means side effects can be created during the instantiation of the store and be cleaned up reliably. When this cleanup is used by your store **Impact** will instantiate the store in the _commit_ phase. This guarantees that the component will be mounted and later unmounted, running the `cleanup`.

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
import { createStore } from "@impact-react/mobx";
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

export const useAppStore = createStore(() => {
  const appStore = makeAutoObservable(new AppStore());

  cleanup(() => appStore.dispose());

  return appStore;
});
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

::: info
With `StrictMode` your store will still initialise twice, also when initialising in the _commit_ phase. This helps verify that your `cleanup` indeed does what it is supposed to do.
:::

You can safely use any observing contexts, like effects, computed etc., within the store without having to explicitly clean them up.

::: code-group

```ts [Impact Signals]
import { createStore, signal, effect, derived } from "@impact-react/signals";

function AppStore(props) {
  const [count, setCount] = signal(0);
  const multipliedCount = derived(() => count() * props.multiplier);

  effect(() => {
    console.log("Mulitplied Count", multipliedCount());
  });

  return {
    count,
    multipliedCount,
  };
}

export const useAppStore = createStore(AppStore);
```

```ts [Mobx (OO)]
import { createStore } from "@impact-react/mobx";
import { makeAutoObservable, autorun } from "mobx";

class AppStore {
  count = 0;
  get multipliedCount() {
    return this.count * this.props.multiplier;
  }
  constructor(props) {
    autorun(() => {
      console.log("Mulitplied Count", this.multipliedCount);
    });
  }
}

export const useAppStore = createStore((props) =>
  makeAutoObservable(new AppStore(props)),
);
```

```ts [Mobx]
import { createStore } from "@impact-react/mobx";
import { observable, autorun } from "mobx";

function AppStore(props) {
  const state = observable({
    count: 0,
    get multipliedCount() {
      return this.count * props.multiplier;
    },
  });

  autorun(() => {
    console.log("Mulitplied Count", state.multipliedCount);
  });

  return state;
}

export const useAppStore = createStore(AppStore);
```

```ts [Preact Signals]
import { createStore } from "@impact-react/preact";
import { signal, effect, computed } from "@preact/signals-react";

function AppStore(props) {
  const count = signal(0);
  const multipliedCount = computed(() => count.value * props.multiplier);

  effect(() => {
    console.log("Mulitplied Count", multipliedCount.value);
  });

  return {
    get count() {
      return count.value;
    },
    get multiplier() {
      return multipliedCount.value;
    },
  };
}

export const useAppStore = createStore(AppStore);
```

```ts [Legend State]
import { createStore } from "@impact-react/legend";
import { observable, observe } from "@legendapp/state";

function AppStore(props) {
  const count = observable(0);
  const multipliedCount = observable(() => count.get() * props.multiplier);

  observe(() => {
    console.log("Mulitplied Count", multipliedCount.get());
  });

  return {
    get count() {
      return count.get();
    },
    get multipliedCount() {
      return multipliedCount.get();
    },
  };
}

export const useAppStore = createStore(AppStore);
```

:::

::: warning

Observing within the store, which includes props, is perfectly safe. All references will be cleaned up by the unmounting of the store, not risking any memory leaks. If you use a parent store and observe from that you will risk memory leaks if you do not explicitly use `cleanup`.

:::
