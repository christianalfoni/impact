"use client";

import { Suspense, useState } from "react";
import { createReactiveContext } from "@impact-react/preact";
import { signal } from "@preact/signals-react";
import { useSignals } from "@preact/signals-react/runtime";

function AppStore() {
  const groceries = signal<string[]>([]);

  return {
    get groceries() {
      return groceries.value;
    },
    addGrocery(item: string) {
      groceries.value = [...groceries.value, item];
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

function App() {
  useSignals();

  const appStore = useAppStore();

  return (
    <useGrocieresStore.Provider groceries={appStore.groceries}>
      <Groceries />
    </useGrocieresStore.Provider>
  );
}

function Groceries() {
  useSignals();

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
}

export function PreactExample() {
  return (
    <useAppStore.Provider>
      <Suspense fallback={<h4>Loading groceries...</h4>}>
        <App />
      </Suspense>
    </useAppStore.Provider>
  );
}
