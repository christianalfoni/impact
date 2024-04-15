import React from "react";
import { createRoot } from "react-dom/client";



import {useStore, signal} from 'impact-react';

function CounterStore() {
  const count = signal(0);



  return {
    get count() {
      return count.value;
    },
    increase() {
      count.value++;
    },
  };
}

export default function App() {
  const {count, increase} = useStore(CounterStore);
  console.log("COUNT", count)
  return <button onClick={increase}>Increase ({count})</button>;
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);

