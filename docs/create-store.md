# createStore

Encapsulates your reactive primitives in a store you can provide to your component tree.

```ts
import { createStore } from "@impact-react/[*]";

function AppStore() {
  return {};
}

export const useAppStore = createStore(AppStore);
```

## Provide

The store should be provided through a component. The store now becomes accessible by the component and any nested component.

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

export default useAppStore.provider(function App() {
  const appStore = useAppStore();

  return (
    <div>
      <h1>Hello App</h1>
      <NestedComponent />
    </div>
  );
});
```

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

const Counter = useCounterStore.provider(function Counter() {
  const counterStore = useCounterStore();

  return <div />;
});

function App() {
  return <Counter initialCount={10} />;
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
