"use client";

import { createStore } from "@impact-react/mobx";
import { observable } from "mobx";

type State = { groceries: string[]; grocery: string };

const useStore = createStore(function Store() {
  const state = observable<State>({
    groceries: [],
    grocery: "",
  });

  return state;
});

const App = useStore.provider(function App() {
  const state = useStore();

  return (
    <div>
      <input
        value={state.grocery}
        style={{
          color: "black",
        }}
        onChange={(event) => (state.grocery = event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            state.groceries.push(state.grocery);
            state.grocery = "";
          }
        }}
      />
      <ul>
        {state.groceries.map((grocery, index) => (
          <li key={index}>{grocery}</li>
        ))}
      </ul>
    </div>
  );
});

export function MobxExample() {
  return <App />;
}
