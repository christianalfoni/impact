"use client";

import {
  createComponent,
  query,
  mutation,
  signal,
  derived,
  useObserver,
  createProvider,
  onDidMount,
} from "@impact-react/signals";

const _groceries: string[] = [];
const getGroceries = () =>
  new Promise<string[]>((resolve) =>
    setTimeout(() => resolve(_groceries.slice()), 1000),
  );
const postGrocery = (grocery: string) =>
  new Promise<void>((resolve) =>
    setTimeout(() => {
      console.log("WUUUT?", grocery);
      _groceries.push(grocery);
      resolve();
    }, 1000),
  );

type State = ReturnType<typeof createState>;

const [provideGroceries, useGroceries] = createProvider<State>();

function createState() {
  const [groceriesQuery, invalidateGroceries] = query(() => getGroceries());
  const groceries = derived(() => {
    const currentGroceriesQuery = groceriesQuery();

    return currentGroceriesQuery.promise.status === "fulfilled"
      ? currentGroceriesQuery.promise.value
      : [];
  });
  const [addingGrocery, addGrocery] = mutation((grocery: string) =>
    postGrocery(grocery).then(invalidateGroceries),
  );
  const [grocery, setGrocery] = signal("");

  const state = {
    groceries,
    addingGrocery,
    addGrocery,
    grocery,
    setGrocery,
  };

  return state;
}

function GroceriesList() {
  using _ = useObserver();

  const state = useGroceries();

  const currentGroceries = state.groceries();

  return (
    <ul>
      {currentGroceries.map((grocery, index) => (
        <li key={index}>{grocery}</li>
      ))}
      {state.addingGrocery()?.data ? (
        <li>Optimistic: {state.addingGrocery()?.data}</li>
      ) : null}
    </ul>
  );
}

const App = createComponent(function App() {
  const state = createState();
  const [div, setDiv] = signal<HTMLDivElement | null>(null);

  onDidMount(() => {
    console.log("I mounted", div());
  });

  provideGroceries(state);

  return () => {
    return (
      <div
        ref={(node) => {
          setDiv(node);
        }}
      >
        <input
          value={state.grocery()}
          style={{
            color: "black",
            opacity:
              state.addingGrocery()?.promise.status === "pending" ? 0.5 : 1,
          }}
          onChange={(event) => state.setGrocery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              state.addGrocery(state.grocery());
              state.setGrocery("");
            }
          }}
        />
        <GroceriesList />
      </div>
    );
  };
});

export function SignalsExample() {
  return <App />;
}
