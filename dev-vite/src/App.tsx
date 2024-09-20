"use client";

import { createStore, effect, signal, use } from "@impact-react/signals";
import { Suspense, useState } from "react";

const useCounterStore = createStore((_, cleanup) => {
  const [count, setCount] = signal(0);

  const interval = setInterval(() => {
    console.log("Tick");
    setCount((current) => current + 1);
  }, 1000);

  cleanup(() => {
    console.log("Cleanup up");
    clearInterval(interval);
  });

  return {
    count,
  };
});

const Counter = useCounterStore.provider(function Counter() {
  const app = useAppStore();
  const state = useCounterStore();

  use(app.promise());

  return <h1>Count {state.count()}</h1>;
});

const useAppStore = createStore(() => {
  const [promise] = signal(new Promise((resolve) => setTimeout(resolve, 5000)));

  return { promise };
});

export default useAppStore.provider(function App() {
  const [show, setShow] = useState(true);
  return (
    <div>
      {show ? (
        <Suspense fallback={<h4>Loading it up...</h4>}>
          <Counter />
        </Suspense>
      ) : null}
      <button onClick={() => setShow(false)}>Hide</button>
    </div>
  );
});
