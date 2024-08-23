---
codeCaption: Nested stores
code: |
  import { signal, useStore, createStoreProvider, cleanup, observer } from 'impact-react'

  function CounterStore(props) {
    const count = signal(props.initialCount)

    const interval = setInterval(() => {
      count(current => current + 1)
    }, 1000)

    cleanup(() => clearInterval(interval))

    return {
      get count() {
        return count()
      }
    }
  }

  const CounterStoreProvider = createStoreProvider(CounterStore)

  const Counter = observer(function Counter() {
    const { count } = useStore(CounterStore)

    return <h2>Count {count}</h2>
  })

  export default function App() {
    return (
      <CounterStoreProvider initialCount={10}>
        <Counter />
      </CounterStoreProvider>
    )
  }
---

# Nested Stores

By default the stores are global, but you can scope them to specific component trees by using a provider.

You create a provider for a store using the `createStoreProvider` function.

```ts
import { createStoreProvider, cleanup, signal } from "impact-react";

export const AppStoreProvider = createStoreProvider(MyStore);

function AppStore() {
  const count = signal(0);

  const interval = setInterval(() => {
    count((current) => current + 1);
  }, 1000);

  cleanup(() => {
    clearInterval(interval);
  });

  return {
    get count() {
      return count();
    },
  };
}
```

Creating nested stores allows you to instantiate state management related to specific pages, features or even for each item in a list. You can start subscriptions and instantiate classes which can be disposed with `cleanup` when unmounting the provider.

With a provider the store can receive props from React. These props are received as `readonly` signals. This is because React might update this prop through reconciliation. You choose if you want to use the prop as an initial value or you keep using `props` to reference the latest value.

```ts
import { createStoreProvider, cleanup, signal } from "impact-react";

export const AppStoreProvider = createStoreProvider(MyStore);

function AppStore(props) {
  const count = signal(props.initialCount);

  return {
    get count() {
      return count();
    },
    get user() {
      return props.user;
    },
  };
}
```

The provided store can be consumed from nested components, but also other nested stores. Think of the stores as traditional React context behaviour, but with primitives improving performance and developer experience.

::: tip

Another aspect of scoping state management is related to typing. Global state management typically defines `null` values for uninitialized state. With [strict null checking](https://www.typescriptlang.org/tsconfig/strictNullChecks.html) enabled you are likely to find your code having many non functional `if` statements to please the type checker. This does not happen in Impact because a store is only initialized when its dependent state is available.

:::

<ClientOnly>
 <Playground />
</ClientOnly>
