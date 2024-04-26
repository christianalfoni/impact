import React, { Suspense, use } from "react";
import { createRoot } from "react-dom/client";

import { useStore, signal } from "impact-react";

function CounterStore() {
  const count = signal(0);
  const time = signal(
    new Promise<string>((resolve) => setTimeout(() => resolve("foo"), 5000))
  );

  return {
    get count() {
      return count.value;
    },
    get time() {
      return time.value;
    },
    increase() {
      count.value++;
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
