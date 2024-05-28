import React, { Suspense, use } from "react";
import { createRoot } from "react-dom/client";

import { useStore, signal, state } from "impact-react";

function CounterStore() {
  const counter = state({
    count: 0,
    time: new Promise<string>((resolve) =>
      setTimeout(() => resolve("foo"), 5000),
    ),
  });

  return {
    get count() {
      return counter.count;
    },
    get time() {
      return counter.time;
    },
    increase() {
      counter.count++;
    },
  };
}

function OtherStore() {
  return {};
}

function Test() {
  using counterStore = useStore(CounterStore);
  const time = use(counterStore.time);

  return <h1>Hi {time}</h1>;
}

export default function App() {
  using counterStore = useStore(CounterStore);
  using otherStore = useStore(OtherStore);

  console.log("RENDERING");
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <Test />
      </Suspense>
      <button onClick={counterStore.increase}>
        Increase ({counterStore.count})
      </button>
      ;
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
