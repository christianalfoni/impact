"use client";

import { createComponent } from "@impact-react/preact";
import { signal } from "@preact/signals-react";

const Groceries = createComponent(function Groceries() {
  const newGrocery = signal("");
  const groceries = signal<string[]>([]);

  function addGrocery() {
    groceries.value = [...groceries.value, newGrocery.value];
    newGrocery.value = "";
  }

  return () => (
    <div>
      <input
        value={newGrocery.value}
        style={{
          color: "black",
        }}
        onChange={(event) => (newGrocery.value = event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            addGrocery();
          }
        }}
      />
      <ul>
        {groceries.value.map((grocery, index) => (
          <li key={index}>{grocery}</li>
        ))}
      </ul>
    </div>
  );
});

export function PreactExample() {
  return <Groceries />;
}
