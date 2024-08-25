"use client";

import { memo, useState } from "react";
import {
  signal,
  useStore,
  createStoreProvider,
  useObserver,
  receiver,
  emitter,
} from "impact-react";

type AppStoreEvents = {
  addGrocery(grocery: string): void;
};

function createGrocery(_name: string) {
  const [name] = signal(_name);

  return {
    id: String(Math.random()),
    name,
  };
}

type Grocery = ReturnType<typeof createGrocery>;

function AppStore() {
  const [groceries, setGroceries] = signal<Grocery[]>([]);

  receiver<AppStoreEvents>({
    addGrocery(name) {
      setGroceries((current) => [...current, createGrocery(name)]);
    },
  });

  return {
    groceries,
  };
}

function GroceriesStore(props: { groceries: () => Grocery[] }) {
  const emit = emitter<AppStoreEvents>();

  return {
    groceries: props.groceries,
    addGrocery(grocery: string) {
      emit.addGrocery(grocery);
    },
  };
}

const GroceriesStoreProvider = createStoreProvider(GroceriesStore);

function App() {
  using _ = useObserver();

  const appStore = useStore(AppStore);

  console.log(appStore.groceries);

  return (
    <GroceriesStoreProvider groceries={appStore.groceries()}>
      <Groceries />
    </GroceriesStoreProvider>
  );
}

function Groceries() {
  using _ = useObserver();

  const [grocery, setGrocery] = useState("");
  const { groceries, addGrocery } = useStore(GroceriesStore);

  return (
    <div>
      <input
        value={grocery}
        style={{
          color: "black",
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
          <li key={index}>{grocery.name()}</li>
        ))}
      </ul>
    </div>
  );
}

export function Counter() {
  return <App />;
}
