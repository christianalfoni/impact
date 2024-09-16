# Lifecycle

An important part of state management is to know when the component mounts and when it unmounts. **Impact** allows you to hook into into these lifecycle hooks to clean up or execute state changes as the DOM is mounted.

::: code-group

```tsx [Impact Signals]
import { createComponent, onWillUnmount, signal } from "@impact-react/signals";

export default createComponent(function Counter() {
  const [count, setCount] = signal(0);

  const interval = setInterval(() => {
    setCount((current) => current + 1);
  }, 1000);

  onWillUnmount(() => clearInterval(interval));

  return () => <h1>Count: {count()}</h1>;
});
```

```tsx [Mobx (OO)]
import { createComponent, onWillUnmount } from "@impact-react/mobx";
import { makeAutoObservable } from "mobx";

class CounterState {
  count = 0;
  interval = setInterval(() => {
    this.count++;
  });
  dispose() {
    clearInterval(this.interval);
  }
}

export default createComponent(function Counter() {
  const state = makeAutoObservable(new CounterState());

  onWillUnmount(() => state.dispose());

  return () => <h1>Count: {state.count}</h1>;
});
```

```tsx [Mobx]
import { createComponent, onWillUnmount } from "@impact-react/mobx";
import { observable } from "mobx";

export default createComponent(function Counter() {
  const state = observable({
    count: 0,
  });

  const interval = setInterval(() => {
    state.count++;
  }, 1000);

  onWillUnmount(() => clearInterval(interval));

  return () => <h1>Count: {state.count}</h1>;
});
```

```tsx [Preact Signals]
import { createComponent, onWillUnmount } from "@impact-react/preact";
import { signal } from "@preact/signals-react";

export default createComponent(function Counter() {
  const count = signal(0);

  const interval = setInterval(() => {
    count.value++;
  }, 1000);

  onWillUnmount(() => clearInterval(interval));

  return () => <h1>Count: {count.value}</h1>;
});
```

```tsx [Legend State]
import { createComponent, onWillUnmount } from "@impact-react/legend";
import { observable } from "@legendapp/state";

export default createComponent(function Counter() {
  const count = observable(0);

  const interval = setInterval(() => {
    count.set((current) => current + 1);
  }, 1000);

  onWillUnmount(() => clearInterval(interval));

  return () => <h1>Count: {count.get()}</h1>;
});
```

:::

Since our reactive context is just a function scope, we are free to do state management beyond just the state we expose to the user interface. In this case we run an interval for as long as the `Counter` is mounted. But this could have been a subscription or some instance you need to dispose of when the component unmounts.

::: info

There are two scenarios where React starts the _render_ phase, initialising the reactive component, but might dispose the component tree before going to the _commit_ phase.

1. **If a nested component during its render phase throws an error**. In this scenario the reactive component catches the error, cleans up and throws the error up the component tree. This allows any parent error boundary to re-render the component tree and the reactive component is initialised again.

2. **If a nested component during its render phase throws a promise**. If the reactive component uses `onWillUnmount` it will include a Suspense boundary during development that catches the thrown promise and throws an error warning that you need to add your own suspense boundary. The reason for this is that React does not provide any mechanism to know when a component tree is disposed before the _commit_ phase. In other words, there would be a risk while suspending where the user changes the state of the application and the reactive component would not run its cleanup.

:::
