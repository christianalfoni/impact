"use client";

import { Suspense, useState } from "react";
import { createStore, observer, query, mutation, use } from "impact-react";
// import { observable } from "mobx";
// import { observer } from "mobx-react-lite";

type AppStoreContext = {
  addGrocery(grocery: string): void;
};

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

function AppStore() {
  const [groceries, invalidateGroceries] = query(() => getGroceries());
  const [addingGrocery, addGrocery] = mutation((grocery: string) =>
    postGrocery(grocery).then(invalidateGroceries),
  );

  return {
    groceries,
    addingGrocery,
    addGrocery,
  };
}

const useAppStore = createStore(AppStore);

function GroceriesStore(props: { groceries: () => string[] }) {
  const { addGrocery } = useAppStore();

  return {
    groceries: props.groceries,
    addGrocery,
  };
}

const useGrocieresStore = createStore(GroceriesStore);

const App = observer(function App() {
  const appStore = useAppStore();

  const groceries = use(appStore.groceries().promise);

  return (
    <useGrocieresStore.Provider groceries={groceries}>
      <h5>Groceries state: {appStore.groceries().state}</h5>
      <Groceries />
    </useGrocieresStore.Provider>
  );
});

const Groceries = observer(function Groceries() {
  const [grocery, setGrocery] = useState("");
  const { addingGrocery } = useAppStore();
  const { groceries, addGrocery } = useGrocieresStore();

  return (
    <div>
      <input
        value={grocery}
        style={{
          color: "black",
          opacity: addingGrocery()?.promise.status === "pending" ? 0.5 : 1,
        }}
        onChange={(event) => setGrocery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            addGrocery(grocery);
            setGrocery("");
          }
        }}
      />
      <ul>
        {groceries().map((grocery, index) => (
          <li key={index}>{grocery}</li>
        ))}
        {addingGrocery()?.data ? (
          <li>Optimistic: {addingGrocery()?.data}</li>
        ) : null}
      </ul>
    </div>
  );
});

export function Counter() {
  return (
    <useAppStore.Provider>
      <Suspense fallback={<h4>Loading groceries...</h4>}>
        <App />
      </Suspense>
    </useAppStore.Provider>
  );
}
