"use client";

import React, { memo, useState } from "react";

import {
  createStoreProvider,
  useObserver,
  Signal,
  useStore,
  Observer,
} from "impact-react";

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

const CounterContent = memo(function CounterContent() {
  const counterStore = useStore(CounterStore);

  return (
    <div>
      <h1>
        Count is: <Observer>{() => counterStore.count}</Observer>
      </h1>
      <button onClick={counterStore.increase}>Increase</button>
    </div>
  );
});
