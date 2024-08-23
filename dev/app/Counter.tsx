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
  const name = signal(_name);

  return {
    id: String(Math.random()),
    get name() {
      return name();
    },
  };
}

function AppStore() {
  const groceries = signal<ReturnType<typeof createGrocery>[]>([]);

  receiver<AppStoreEvents>({
    addGrocery(name) {
      groceries((current) => [...current, createGrocery(name)]);
    },
  });

  return {
    get groceries() {
      return groceries();
    },
  };
}

function GroceriesStore(props: { groceries: string[] }) {
  const emit = emitter<AppStoreEvents>();

  return {
    get groceries() {
      return props.groceries;
    },
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
    <GroceriesStoreProvider groceries={appStore.groceries}>
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
        {groceries.map((grocery, index) => (
          <li key={index}>{grocery}</li>
        ))}
      </ul>
    </div>
  );
}

export function Counter() {
  return <App />;
}
