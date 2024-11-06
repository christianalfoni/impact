import { createStore } from "@impact-react/signals";
import { signal } from "@impact-react/signals";

function CounterStore() {
  const [list, setList] = signal([{ title: "foo" }]);

  return { list, setList };
}

const useCounterStore = createStore(CounterStore);

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
