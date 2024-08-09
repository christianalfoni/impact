import React, { Suspense, memo, useState } from "react";
import { createRoot } from "react-dom/client";

import { createStoreProvider, derived, signal, useStore } from "impact-react";

function CounterStore() {
  const count = signal(0);
  const double = derived(() => count() * 2);

  return {
    get count() {
      return count();
    },
    get double() {
      return double();
    },
    increase() {
      count((current) => current + 1);
    },
  };
}

const useCounter = () => useStore(CounterStore);
const CounterStoreProvider = createStoreProvider(CounterStore);

const Test2 = memo(function Test2() {
  using counter = useCounter();

  return (
    <div>
      <h1>Hi {counter.double}</h1>;
      <button onClick={counter.increase}>Increase</button>;
    </div>
  );
});

export default function App() {
  const [mounted, setMounted] = useState(true);

  return (
    <div>
      {mounted ? (
        <CounterStoreProvider>
          <Test2 />
        </CounterStoreProvider>
      ) : null}
      <button onClick={() => setMounted(!mounted)}>Mount/Unmount</button>
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
