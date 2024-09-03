# Observers

## useObserver

A modern pattern to make components observe. With the new JavaScript feature [Explicit Resource Management](https://github.com/tc39/proposal-explicit-resource-management) you can observe in components without affecting how they are defined.

```tsx
import { useObserver } from "@impact-react/signals";

function MyComponent() {
  using _ = useObserver();

  const { count } = useCounterStore();

  return <div>{count}</div>;
}
```

::: warning

Explicit Resource Management is currently a Stage 3 proposal. It works out of the box with latest TypeScript, SWC and ESBuild. Implementations in browsers is on its way. Babel currently requires a [plugin](https://babeljs.io/docs/babel-plugin-proposal-explicit-resource-management).

:::

## Observer

Allows you to target signal observation at specific points in components. Useful for complicated UIs and signals that update often. **Note!** that the `Observer` will call the signal function to unwrap the value.

```tsx
import { Observer } from "@impact-react/signals";

function MyComponent() {
  const { count } = useCounterStore();

  return (
    <div>
      <Observer>{count}</Observer>
    </div>
  );
}
```

## observer

The traditional higher order component to observe any signals accessed in a component. This is a typical observation pattern, but affects how you define your component.

```tsx
import { observer } from "@impact-react/signals";

const MyComponent = observer(function MyComponent() {
  const { count } = useCounterStore();

  return <div>{count()}</div>;
});
```
