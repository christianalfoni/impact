import { createStore } from "@impact-react/preact";
import { signal } from "@preact/signals-react";

function CounterStore() {
  const list = signal([{ title: "foo" }]);

  return { list };
}

const useCounterStore = createStore(CounterStore);

function Counter() {
  const state = useCounterStore();

  return (
    <div>
      <button
        onClick={() =>
          (state.list.value = [
            {
              title: "BlappatiBlapp",
            },
            ...state.list.value.slice(1),
          ])
        }
      >
        Change name
      </button>
      <button
        onClick={() =>
          (state.list.value = [...state.list.value, { title: "BOOOOH" }])
        }
      >
        Add
      </button>
      <ul>
        {state.list.value.map((item, index) => (
          <li key={index}>{item.title}</li>
        ))}
      </ul>
    </div>
  );
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
