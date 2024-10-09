# createStore

Encapsulates your reactive primitives in a store you can provide to your component tree.

```ts
import { createStore } from "@impact-react/[*]";

function AppStore() {
  return {};
}

export const useAppStore = createStore(AppStore);
```

## Provider

The store should be provided to the component tree using the `.Provider`.

```tsx
import { createStore } from "@impact-react/[*]";

function AppStore() {
  return {};
}

export const useAppStore = createStore(AppStore);

function NestedComponent() {
  const appStore = useAppStore();

  return <div />;
}

function App() {
  const appStore = useAppStore();

  return (
    <div>
      <h1>Hello App</h1>
      <NestedComponent />
    </div>
  );
}

export function AppView() {
  return (
    <useAppStore.Provider>
      <App />
    </useAppStore.Provider>
  );
}
```

::: tip
Providing stores is often tied to views, as opposed to single components. Using that as a naming convention can be a good idea. It is also a good spot to add any error boundaries or suspense boundaries for the view.
:::

## Props

The store can define props that it will receive from the component providing the store:

```tsx
import { createStore } from "@impact-react/[*]";

type Props = { initialCount: number };

function CounterStore(props: Props) {
  props.initialCount;
  return {};
}

export const useCounterStore = createStore(CounterStore);

function Counter() {
  const counterStore = useCounterStore();

  return <div />;
}

function App() {
  return (
    <useCounterStore.Provider initialCount={10}>
      <Counter />
    </useCounterStore.Provider>
  );
}
```

The props will become observable _getters_. When React reconciles with updated props the store can observe those changes.

## Cleanup

If your store instantiates with a side effect the `cleanup` function lets you clean that up. The `cleanup` function is guaranteed to run as the store will initialise during the _commit_ phase of React when used.

```ts
import { createStore, Cleanup } from "@impact-react/[*]";

function AppStore(props: unknown, cleanup: Cleanup) {
  const interval = setInterval(() => {}, 1000);

  cleanup(() => clearInterval(interval));

  return {};
}

export const useAppStore = createStore(AppStore);
```
