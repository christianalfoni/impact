# Reactive Components

Let us get back to our `Counter` and see how you would normally make it stateful:

```tsx
import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={() => setCount(count + 1)}>Increase</button>
    </div>
  );
}
```

The great thing about hooks is the fact that we can still embrace the components as a function. But that gain can bring with it so much pain as your state management becomes more than just syncing values with the user interface inside the same component.

Instead of hooks we are going to take inspiration from [Vue]() and enable us to combine reactive state management with a reconciling user interface:

::: code-group

```tsx [Impact Signals]
import { createComponent, signal } from "@impact-react/signals";

export default createComponent(function Counter() {
  const [count, setCount] = signal(0);

  return () => (
    <div>
      <h1>Count: {count()}</h1>
      <button onClick={() => setCount((current) => current + 1)}>
        Increase
      </button>
    </div>
  );
});
```

```tsx [Mobx (OO)]
import { createComponent } from "@impact-react/mobx";
import { makeAutoObservable } from "mobx";

class CounterState {
  count = 0;
  increase() {
    this.count++;
  }
}

export default createComponent(function Counter() {
  const state = makeAutoObservable(new CounterState());

  return () => (
    <div>
      <h1>Count: {state.count}</h1>
      <button onClick={() => state.increase()}>Increase</button>
    </div>
  );
});
```

```tsx [Mobx]
import { createComponent } from "@impact-react/mobx";
import { observable } from "mobx";

export default createComponent(function Counter() {
  const state = observable({
    count: 0,
  });

  return () => (
    <div>
      <h1>Count: {state.count}</h1>
      <button onClick={() => state.count++}>Increase</button>
    </div>
  );
});
```

```tsx [Preact Signals]
import { createComponent } from "@impact-react/preact";
import { signal } from "@preact/signals-react";

export default createComponent(function Counter() {
  const count = signal(0);

  return () => (
    <div>
      <h1>Count: {count.value}</h1>
      <button onClick={() => count.value++}>Increase</button>
    </div>
  );
});
```

```tsx [Legend State]
import { createComponent } from "@impact-react/legend";
import { observable } from "@legendapp/state";

export default createComponent(function Counter() {
  const count = observable(0);

  return () => (
    <div>
      <h1>Count: {count.get()}</h1>
      <button onClick={() => count.set((current) => current + 1)}>
        Increase
      </button>
    </div>
  );
});
```

:::

Now the component has a reactive scope where we do state management and a reconciling scope where we describe the user interface. The reactive scope runs once, when the component initialises. The returned function for the user interface will run every time the observed state and/or props change.

::: info

In a reactive component you can not use hooks. This is because the component initialises in Reacts _commit_ phase, as opposed to the _render_ phase where hooks are evaluated. But this mechanism guarantees that the component will _mount_ and _unmount_ with the related lifecycle hooks. Think of it as brain melting prevention.

:::

Reactive components are used very much like controllers in older UI frameworks. They represent a bigger piece of UI, like the whole application or a page, but could be as small as a form or a highly interactive list. The common requirement here is that the state and management needs to be accessible by nested components.
