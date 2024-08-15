"use client";

import { signal, useStore } from "impact-react";

function CounterStore() {
  const count = signal(0);

  return {
    get count() {
      return count();
    },
    increase() {
      count((current) => current + 1);
    },
  };
}

export function Counter() {
  using counterStore = useStore(CounterStore);

  return (
    <div>
      <h1>Count is: {counterStore.count}</h1>
      <button onClick={counterStore.increase}>Increase</button>
    </div>
  );
}
