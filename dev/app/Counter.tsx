"use client";

import React, { useEffect, useRef, useState } from "react";

import { createStoreProvider, Signal, useStore } from "impact-react";
import { connectBridge } from "impact-react-debugger";

function CounterStore(props: { initialCount: Signal<number> }) {
  const count = props.initialCount;

  return {
    get count() {
      return count();
    },
    increase() {
      count((current) => current + 1);
    },
  };
}

const CounterStoreProvider = createStoreProvider(CounterStore);

export function Counter() {
  const iframe = useRef<HTMLIFrameElement>();
  const [count, setCount] = useState(0);

  const connectIframeToBridge = (iframe: HTMLIFrameElement) => {
    if (iframe.contentWindow) {
      connectBridge(iframe.contentWindow);
    }
  };

  return (
    <>
      <button onClick={() => setCount((current) => current + 1)}>
        Change initial
      </button>
      <CounterStoreProvider initialCount={count}>
        <CounterContent />
      </CounterStoreProvider>

      <br />

      <div className="rounded overflow-hidden m-5">
        <iframe
          ref={connectIframeToBridge}
          width="100%"
          height="500px"
          src="/debugger"
        />
      </div>
    </>
  );
}

function CounterContent() {
  using counterStore = useStore(CounterStore);

  return (
    <div>
      <h1>Count is: {counterStore.count}</h1>
      <button onClick={counterStore.increase}>Increase</button>
    </div>
  );
}
