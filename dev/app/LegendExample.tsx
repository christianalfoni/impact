"use client";

import { createComponent } from "@impact-react/legend";
import { observable } from "@legendapp/state";

const Groceries = createComponent(function Groceries() {
  const newGrocery = observable("");
  const groceries = observable<string[]>([]);

  function addGrocery() {
    groceries.set((current) => [...current, newGrocery.get()]);
    newGrocery.set("");
  }

  return () => (
    <div>
      <input
        value={newGrocery.get()}
        style={{
          color: "black",
        }}
        onChange={(event) => newGrocery.set(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            addGrocery();
          }
        }}
      />
      <ul>
        {groceries.get().map((grocery, index) => (
          <li key={index}>{grocery}</li>
        ))}
      </ul>
    </div>
  );
});

export function LegendExample() {
  return <Groceries />;
}
