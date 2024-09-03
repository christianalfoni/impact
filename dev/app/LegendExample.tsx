"use client";

import { Suspense, useState } from "react";
import { createReactiveContext } from "@impact-react/legend";
import { observable } from "@legendapp/state";
import { observer } from "@legendapp/state/react";

function AppStore() {
  const groceries = observable<string[]>([]);

  return {
    get groceries() {
      return groceries.get();
    },
    addGrocery(item: string) {
      groceries.set((current) => [...current, item]);
    },
  };
}

const useAppStore = createReactiveContext(AppStore);

function GroceriesStore(props: { groceries: string[] }) {
  const { addGrocery } = useAppStore();

  return {
    groceries() {
      return props.groceries;
    },
    addGrocery,
  };
}

const useGrocieresStore = createReactiveContext(GroceriesStore);

const App = observer(function App() {
  const appStore = useAppStore();

  return (
    <useGrocieresStore.Provider groceries={appStore.groceries}>
      <Groceries />
    </useGrocieresStore.Provider>
  );
});

const Groceries = observer(function Groceries() {
  const [grocery, setGrocery] = useState("");
  const { groceries, addGrocery } = useGrocieresStore();

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
          <li key={index}>{grocery}</li>
        ))}
      </ul>
    </div>
  );
});

export function LegendExample() {
  return (
    <useAppStore.Provider>
      <Suspense fallback={<h4>Loading groceries...</h4>}>
        <App />
      </Suspense>
    </useAppStore.Provider>
  );
}
