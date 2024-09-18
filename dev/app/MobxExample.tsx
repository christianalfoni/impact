"use client";

import { createComponent, useStore } from "@impact-react/mobx";
import { observable, configure } from "mobx";

configure({
  enforceActions: "never",
});

type State = { groceries: string[]; grocery: string };

function Store() {
  const state = observable<State>({
    groceries: [],
    grocery: "",
  });

  return state;
}

export const useApp = () => useStore(Store);

function App() {
  const state = useApp();

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
}

const ReactiveApp = createComponent(Store, App);

export function MobxExample() {
  return <ReactiveApp />;
}
