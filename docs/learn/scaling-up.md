# Scaling Up

**Impact** enables a progressive scaling of state management. By default you can inline your state management with the user interface.

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

But as it grows you can move the state management out to its own function.

::: code-group

```tsx [Impact Signals]
import { createComponent, signal } from "@impact-react/signals";

function createState() {
  const [count, setCount] = signal(0);

  return {
    get count() {
      return count();
    },
    increase() {
      setCount((current) => current + 1);
    },
  };
}

export default createComponent(function Counter() {
  const state = createState();

  return () => (
    <div>
      <h1>Count: {state.count}</h1>
      <button onClick={state.increase}>Increase</button>
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

function createState() {
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

export default createComponent(function Counter() {
  const state = createState();

  return () => (
    <div>
      <h1>Count: {state.count}</h1>
      <button onClick={state.increase}>Increase</button>
    </div>
  );
});
```

```tsx [Preact Signals]
import { createComponent } from "@impact-react/preact";
import { signal } from "@preact/signals-react";

function createState() {
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

export default createComponent(function Counter() {
  const state = createState();

  return () => (
    <div>
      <h1>Count: {state.value}</h1>
      <button onClick={state.increase}>Increase</button>
    </div>
  );
});
```

```tsx [Legend State]
import { createComponent } from "@impact-react/legend";
import { observable } from "@legendapp/state";

function createState() {
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

export default createComponent(function Counter() {
  const state = createState();

  return () => (
    <div>
      <h1>Count: {state.count}</h1>
      <button onClick={state.increase}>Increase</button>
    </div>
  );
});
```

:::

But with state complexity you often also have user interface complexity. You want to avoid passing all your state as props, but rather just make it available to any nested component. Normally in this situation you have to re-organise your components to provide it through a React context, also risking performance issues, or move to a global reactive paradigm with new primitives. With **Impact** you can naturally progress by exposing the state to any nested components as well.

::: code-group

```tsx [Impact Signals]
import { createComponent, createProvider, signal } from "@impact-react/signals";

function createState() {
  const [count, setCount] = signal(0);

  return {
    get count() {
      return count();
    },
    increase() {
      setCount((current) => current + 1);
    },
  };
}

type State = {
  count: number;
  increase(): void;
};

const [provideCounter, useCounter] = createProvider<State>();

export { useCounter };

export default createComponent(function Counter() {
  const state = createState();

  provideCounter(state);

  return () => (
    <div>
      <h1>Count: {state.count}</h1>
      <button onClick={state.increase}>Increase</button>
    </div>
  );
});
```

```tsx [Mobx (OO)]
import { createComponent, createProvider } from "@impact-react/mobx";
import { makeAutoObservable } from "mobx";

class CounterState {
  count = 0;
  increase() {
    this.count++;
  }
}

const [provideCounter, useCounter] = createProvider<CounterState>();

export { useCounter };

export default createComponent(function Counter() {
  const state = makeAutoObservable(new CounterState());

  provideCounter(state);

  return () => (
    <div>
      <h1>Count: {state.count}</h1>
      <button onClick={() => state.increase()}>Increase</button>
    </div>
  );
});
```

```tsx [Mobx]
import { createComponent, createProvider } from "@impact-react/mobx";
import { observable } from "mobx";

function createState() {
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

type State = {
  count: number;
  increase(): void;
};

const [provideCounter, useCounter] = createProvider<State>();

export { useCounter };

export default createComponent(function Counter() {
  const state = createState();

  provideCounter(state);

  return () => (
    <div>
      <h1>Count: {state.count}</h1>
      <button onClick={state.increase}>Increase</button>
    </div>
  );
});
```

```tsx [Preact Signals]
import { createComponent, createProvider } from "@impact-react/preact";
import { signal } from "@preact/signals-react";

function createState() {
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

type State = {
  count: number;
  increase(): void;
};

const [provideCounter, useCounter] = createProvider<State>();

export default createComponent(function Counter() {
  const state = createState();

  provideCounter(state);

  return () => (
    <div>
      <h1>Count: {state.value}</h1>
      <button onClick={state.increase}>Increase</button>
    </div>
  );
});
```

```tsx [Legend State]
import { createComponent, createProvider } from "@impact-react/legend";
import { observable } from "@legendapp/state";

function createState() {
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

type State = {
  count: number;
  increase(): void;
};

const [provideCounter, useCounter] = createProvider<State>();

export { useCounter };

export default createComponent(function Counter() {
  const state = createState();

  provideCounter(state);

  return () => (
    <div>
      <h1>Count: {state.count}</h1>
      <button onClick={state.increase}>Increase</button>
    </div>
  );
});
```

:::

The `useCounter` can be used in the reactive state management scope of a component or in any other traditional component.

::: info

React components that uses the `useCounter` will need to add observation from the related reactive React package.

:::
