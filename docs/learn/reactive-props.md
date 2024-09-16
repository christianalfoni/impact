# Reactive Props

With **Impact** the props passed to a reactive component becomes reactive. That means you can use the props with reactive primitives like computing state or running effects. But you can also use them directly in your user interface, as you are used to, where the user interface reconciles when the prop changes.

::: warning
Because the `props` are reactive you can not destructure them. The reason is that each key is a _getter_ to the underlying observable prop. The `children` prop is a plain getter accessing the current children.
:::

::: code-group

```tsx [Impact Signals]
import { createComponent, signal, derived } from "@impact-react/signals";

export default createComponent(function Counter(props) {
  const [multiply, setMultiply] = signal(false);
  const count = derived(() => (multiply() ? props.count * 2 : props.count));

  return () => (
    <div>
      <h1>Count: {count()}</h1>
      <button
        onClick={() => {
          setMultiply((current) => !current);
        }}
      >
        Toggle multiply
      </button>
    </div>
  );
});
```

```tsx [Mobx (OO)]
import { createComponent } from "@impact-react/mobx";
import { makeAutoObservable } from "mobx";

class CounterState {
  mulitply = false;
  get count() {
    return this.multiply ? this.props.count * 2 : this.props.count;
  }
  constructor(props) {
    this.props = props;
  }
  toggleMultiply() {
    this.multiply = !this.multiply;
  }
}

export default createComponent(function Counter(props) {
  const state = makeAutoObservable(new CounterState(props));

  return () => (
    <div>
      <h1>Count: {count()}</h1>
      <button
        onClick={() => {
          state.toggleMultiply();
        }}
      >
        Toggle multiply
      </button>
    </div>
  );
});
```

```tsx [Mobx]
import { createComponent } from "@impact-react/mobx";
import { observable } from "mobx";

export default createComponent(function Counter(props) {
  const state = observable({
    multiply: false,
    get count() {
      return this.multiply ? props.count * 2 : props.count;
    },
  });

  return () => (
    <div>
      <h1>Count: {state.count}</h1>
      <button
        onClick={() => {
          state.multiply = !state.multiply;
        }}
      >
        Toggle multiply
      </button>
    </div>
  );
});
```

```tsx [Preact Signals]
import { createComponent } from "@impact-react/preact";
import { signal, computed } from "@preact/signals-react";

export default createComponent(function Counter(props) {
  const multiply = signal(false);
  const count = computed(() =>
    multiply.value ? props.count * 2 : props.count,
  );

  return () => (
    <div>
      <h1>Count: {count.value}</h1>
      <button
        onClick={() => {
          multiply.value = !multiply.value;
        }}
      >
        Toggle multiply
      </button>
    </div>
  );
});
```

```tsx [Legend State]
import { createComponent } from "@impact-react/legend";
import { observable } from "@legendapp/state";

export default createComponent(function Counter(props) {
  const multiply = observable(false);
  const count = observable(() =>
    multiply.get() ? props.count * 2 : props.count,
  );

  return () => (
    <div>
      <h1>Count: {count.get()}</h1>
      <button
        onClick={() => {
          multiply.set((current) => !current);
        }}
      >
        Toggle multiply
      </button>
    </div>
  );
});
```

:::
