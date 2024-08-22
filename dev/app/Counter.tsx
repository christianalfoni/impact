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

function AppStore(props: { username: Signal<string> }) {
  const username = props.username;

  return {
    get username() {
      return username();
    },
    setUsername(value: string) {
      username(value);
    },
  };
}

const AppStoreProvider = createStoreProvider(AppStore);
const CounterStoreProvider = createStoreProvider(CounterStore);

export function Counter() {
  const [count, setCount] = useState(0);
  const iframe = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const delayToAvoidTwiceCall = setTimeout(() => {
      if (iframe.current?.contentWindow) {
        connectBridge(iframe.current.contentWindow);
      }
    }, 1000);

    return () => {
      clearTimeout(delayToAvoidTwiceCall);
    };
  }, [iframe]);

  return (
    <>
      <AppStoreProvider username="John Doe">
        <button onClick={() => setCount((current) => current + 1)}>
          Change initial
        </button>

        <CounterStoreProvider initialCount={count}>
          <CounterContent />
        </CounterStoreProvider>
      </AppStoreProvider>
      <br />

      <div className="rounded overflow-hidden m-5">
        <iframe ref={iframe} width="100%" height="500px" src="/debugger" />
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
