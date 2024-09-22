import { useState } from "react";

const useCounterStore = createStore((_, cleanup) => {
  const [count, setCount] = signal(50);

  const interval = setInterval(() => setCount(count() + 1), 1000);

  cleanup(() => clearInterval(interval));

  return {
    count,
  };
});

export const Counter = useCounterStore.provider(function Counter() {
  const state = useCounterStore();

  return <h1>Count {state.count() + 5}</h1>;
});

