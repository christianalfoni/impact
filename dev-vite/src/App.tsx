import { createStore } from "@impact-react/signals";
import { signal } from "@impact-react/signals";
import { createStoreValue } from "@impact-react/store";

const injectFoo = createStoreValue<string>();

function CounterStore() {
  const [list, setList] = signal([{ title: "foo" }]);

  injectFoo("bar");

  return { list, setList };
}

const useCounterStore = createStore(CounterStore);

function NestedStore() {
  const foo = injectFoo();

  const [observableFoo] = signal(foo);

  return {
    observableFoo,
  };
}

const useNestedStore = createStore(NestedStore);

function Counter() {
  const state = useCounterStore();

  return (
    <div>
      <button
        onClick={() =>
          state.setList((current) => [
            {
              title: "BlappatiBlapp",
            },
            ...current.slice(1),
          ])
        }
      >
        Change name
      </button>
      <button
        onClick={() =>
          state.setList((current) => [...current, { title: "BOOOOH" }])
        }
      >
        Add
      </button>
      <ul>
        {state.list().map((item, index) => (
          <li key={index}>{item.title}</li>
        ))}
      </ul>
      <useNestedStore.Provider>
        <Nested />
      </useNestedStore.Provider>
    </div>
  );
}

function Nested() {
  const { observableFoo } = useNestedStore();

  return <h1>hihi {observableFoo()}</h1>;
}

export function App() {
  return (
    <div>
      <useCounterStore.Provider>
        <Counter />
      </useCounterStore.Provider>
    </div>
  );
}
