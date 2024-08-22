"use client";

import React, { useState } from "react";

import { createStoreProvider, observer, Signal, useStore } from "impact-react";

function CounterStore(props: { count: number }) {
  return {
    get count() {
      return props.count;
    },
    increase() {
      // count((current) => current + 1);
    },
  };
}

const CounterStoreProvider = createStoreProvider(CounterStore);

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <>
      <button onClick={() => setCount((current) => current + 1)}>
        Change initial
      </button>
      <CounterStoreProvider count={count}>
        <CounterContent />
      </CounterStoreProvider>
    </>
  );
}

function CounterContent() {
  using _ = observer();

  const { count, increase } = useStore(CounterStore);

  return (
    <div>
      <h1>Count is: {count}</h1>
      <button onClick={increase}>Increase</button>
    </div>
  );
}
