import React, { Suspense, memo, useState } from "react";
import { createRoot } from "react-dom/client";

import {
  createStoreProvider,
  derived,
  effect,
  Signal,
  signal,
  use,
  useStore,
} from "impact-react";

function CounterStore(props: { count: Signal<number> }) {
  const count = signal(0);

  effect(() => {
    count(props.count());
  });

  return {
    get count() {
      return count();
    },
    increase() {
      count((current) => current + 1);
    },
  };
}

const useCounter = () => useStore(CounterStore);
const CounterStoreProvider = createStoreProvider(CounterStore);

function Counter() {
  using counter = useCounter();

  return (
    <div>
      <h1>The count is {counter.count}</h1>
      <button onClick={counter.increase}>Increase</button>;
    </div>
  );
}

export default function App() {
  const [initialCount, setInitialCount] = useState(0);

  return (
    <div>
      <button onClick={() => setInitialCount(5)}>Change initial count</button>
      <CounterStoreProvider count={initialCount}>
        <Counter />
      </CounterStoreProvider>
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
