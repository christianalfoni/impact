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

To make our state management reactive we first need to move it into its own scope, actually just like creating a hook:

```tsx
import { useState } from "react";

function useCounter() {
  const [count, setCount] = useState(0);

  return {
    count,
    increase() {
      setCount((current) => current + 1);
    },
  };
}

export default function Counter() {
  const state = useCounter();

  return (
    <div>
      <h1>Count: {state.count}</h1>
      <button onClick={state.increase}>Increase</button>
    </div>
  );
}
```

But we are still left with state management that reconciles. Also if we want to share this state management with nested components we need to separate it into a context and provide it as a parent of the `Counter`.

Let us rather make this reactive and accessible:

::: code-group

```tsx [Impact Signals]
import { createComponent, useStore } from "@impact-react/signals";

function Store() {
  const [count, setCount] = signal(0);

  return {
    count,
    increase() {
      setCount((current) => current + 1);
    },
  };
}

export const useCounter = () => useStore(Store);

function Counter() {
  const counter = useCounter();

  return (
    <div>
      <h1>Count: {counter.count()}</h1>
      <button onClick={counter.increase}>Increase</button>
    </div>
  );
}

export default createComponent(Store, Counter);
```

```tsx [Mobx (OO)]
import { createComponent, useStore } from "@impact-react/mobx";
import { makeAutoObservable } from "mobx";

class CounterState {
  count = 0;
  increase() {
    this.count++;
  }
}

function Store() {
  return makeAutoObservable(new CounterState());
}

export const useCounter = () => useStore(Store);

function Counter() {
  const counter = useCounter();

  return (
    <div>
      <h1>Count: {counter.count}</h1>
      <button onClick={() => counter.increase()}>Increase</button>
    </div>
  );
}

export default createComponent(Store, Counter);
```

```tsx [Mobx]
import { createComponent, useStore } from "@impact-react/mobx";
import { observable } from "mobx";

function Store() {
  const state = observable({
    count: 0,
  });

  return {
    get count() {
      return state.count;
    },
    increase() {
      state.count++;
    },
  };
}

export const useCounter = useStore(Store);

function Counter() {
  const counter = useCounter();

  return (
    <div>
      <h1>Count: {counter.count}</h1>
      <button onClick={counter.increase}>Increase</button>
    </div>
  );
}

export default createComponent(Store, Counter);
```

```tsx [Preact Signals]
import { createComponent, useStore } from "@impact-react/preact";
import { signal } from "@preact/signals-react";

function Store() {
  const count = signal(0);

  return {
    get count() {
      return count.value;
    },
    increase() {
      count.value++;
    },
  };
}

export const useCounter = () => useStore(Store);

function Counter() {
  const counter = useCounter();

  return (
    <div>
      <h1>Count: {counter.count}</h1>
      <button onClick={counter.increase}>Increase</button>
    </div>
  );
}

export default createComponent(Store, Counter);
```

```tsx [Legend State]
import { createComponent, useStore } from "@impact-react/legend";
import { observable } from "@legendapp/state";

function Store() {
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

export const useCounter = () => useStore(Store);

function Counter() {
  const counter = useCounter();

  return (
    <div>
      <h1>Count: {counter.count}</h1>
      <button onClick={counter.increase}>Increase</button>
    </div>
  );
}

export default createComponent(Store, Counter);
```

:::

Now the component has a reactive scope where we do state management and a reconciling scope where we describe the user interface. The reactive scope runs once, when the component initialises. The returned function for the user interface will run every time the observed state and/or props change.

::: info

In a reactive component you can not use hooks. This is because the component initialises in Reacts _commit_ phase, as opposed to the _render_ phase where hooks are evaluated. But this mechanism guarantees that the component will _mount_ and _unmount_ with the related lifecycle hooks. Think of it as brain melting prevention.

:::

Reactive components are used very much like controllers in older UI frameworks. They represent a bigger piece of UI, like the whole application or a page, but could be as small as a form or a highly interactive list. The common requirement here is that the state and management needs to be accessible by nested components.
