# Observers

## observer

The traditional higher order component to observe any signals accessed in a component. This is a typical observation pattern, but affects how you define your component.

```tsx
import { observer } from "impact-react";

const MyComponent = observer(function MyComponent() {
  const { count } = useCounterStore();

  return <div>{count}</div>;
});
```

## Observer

Allows you to target signal observation inside components. Useful for complicated UIs and signals that update often. Note that you need to access the actual signal in the callback.

```tsx
import { Observer } from "impact-react";

function MyComponent() {
  const counterStore = useCounterStore();

  return (
    <div>
      <Observer>{() => counterStore.count}</Observer>
    </div>
  );
}
```

## useObserver

A modern pattern to make components observe. With the new JavaScript feature [Explicit Resource Management](https://github.com/tc39/proposal-explicit-resource-management) you can observe in components without affecting how they are defined.

```tsx
import { useObserver } from "impact-react";

function MyComponent() {
  using _ = useObserver();

  const { count } = useCounterStore();

  return <div>{count}</div>;
}
```
