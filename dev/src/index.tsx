import React, { Suspense, memo } from "react";
import { createRoot } from "react-dom/client";

import { derived, signal, use, useStore } from "impact-react";

function CounterStore() {
  const count = signal(0);
  const double = derived(() => count() * 2);
  const time = signal(
    new Promise<string>((resolve) => setTimeout(() => resolve("foo"), 1000)),
  );

  return {
    get count() {
      return count();
    },
    get double() {
      return double();
    },
    get time() {
      return time();
    },
    increase() {
      count((current) => current + 1);
    },
  };
}

const useCounter = () => useStore(CounterStore);

function Test() {
  using counter = useCounter();

  return <h1>Hi {use(counter.time)}</h1>;
}

const Test2 = memo(function Test2() {
  using counter = useCounter();

  return <h1>Hi {counter.double}</h1>;
});

export default function App() {
  using counter = useCounter();

  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <Test />
        <Test2 />
      </Suspense>
      <button onClick={counter.increase}>Increase</button>;
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
