import React, { Suspense, memo, use } from "react";
import { createRoot } from "react-dom/client";

import { useStore, signal, store } from "impact-react";

function CounterStore() {
  const counter = store({
    count: 0,
    get double() {
      return counter.count * 2;
    },
    time: new Promise<string>((resolve) =>
      setTimeout(() => resolve("foo"), 5000),
    ),
    increase() {
      counter.count++;
    },
  });

  return counter.readonly();
}

function OtherStore() {
  return {};
}

function Test() {
  using counterStore = useStore(CounterStore);

  const time = use(counterStore.time);

  return <h1>Hi {time}</h1>;
}

const Test2 = memo(function Test2() {
  using counterStore = useStore(CounterStore);

  return <h1>Hi {counterStore.double}</h1>;
});

export default function App() {
  using counterStore = useStore(CounterStore);

  console.log("RENDERING");
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <Test />
        <Test2 />
      </Suspense>
      <button onClick={counterStore.increase}>Increase</button>;
    </div>
  );
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
