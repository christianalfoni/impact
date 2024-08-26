<p align="center">
  <img align="center" src="./Icon.png" />
</p>
<p align="center">
  <b>Impact React stores for Mobx</b>
</p>

<p align="center">
  <a href="https://impact-react.dev" style="font-size:18px;">https://impact-react.dev</a>
</p>

## Creating a store

```tsx
import { action, observable } from "mobx";
import { observer } from "mobx-react-lite";
import { createStore } from "impact-react-mobx";

function CounterStore(props) {
  const state = observable({
    count: props.initialCount,
  });

  return {
    get count() {
      return state.count;
    },
    increase: action(() => {
      state.count++;
    }),
  };
}

const useCounterStore = createStore(CounterStore);

const Counter = observer(function Counter() {
  const { count, increase } = useCounterStore();

  return (
    <div>
      <h1>The count is: {count}</h1>
      <button onClick={increase}>Increase</button>
    </div>
  );
});

function App() {
  return (
    <useCounterStore.Provider initialCount={10}>
      <Counter />
    </useCounterStore.Provider>
  );
}
```

**Props** to a store is an observable. When React reconciles and updates the prop, the props in the store also updates. That means `props.count` can be used with `autorun`, `computed` or even exposed from the store:

```ts
function MyStore(props) {
  return {
    get someObservableProp() {
      return props.observableProp;
    },
  };
}
```
