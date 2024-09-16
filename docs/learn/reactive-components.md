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

The great thing about hooks is the fact that we can still embrace the components as a function. But that gain can bring with it so much pain as your state management becomes more than just syncing values with the user interface. Instead of hooks we are going to bring back an old React API with a new signature, `createComponent`.

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

Now the function has a reactive scope where we do state management and it returns a reconciling scope where we describe the user interface. The reactive scope runs once, when the component initialises. The returned function for the user interface will run every time the observed state and/or props change.
