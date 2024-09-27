"use client";

import { createStore } from "@impact-react/mobx";
import { connectDebuggerBridge } from "impact-react-debugger";
import { observable } from "mobx";

import { useEffect, useRef, useState } from "react";

type State = { groceries: string[]; grocery: string };

const useStore = createStore(function Store(props: { foo: string }) {
  const state = observable<State>({
    groceries: [],
    grocery: "",
  });

  return state;
});

const useConditionalStore = createStore(function ConditionalStore() {
  const state = observable<{ visible: boolean }>({
    visible: true,
  });

  return state;
});

function ConditionalComponent() {
  return <p>Hello, I'm a conditional store</p>;
}

function App() {
  const iframe = useRef<HTMLIFrameElement>(null);
  const [showConditionalStore, setShowConditionalStore] = useState(false);
  const state = useStore();

  useEffect(() => {
    const delayToAvoidCallTwice = setTimeout(() => {
      if (iframe.current?.contentWindow) {
        connectDebuggerBridge(iframe.current.contentWindow);
      }
    }, 1000);

    return () => {
      clearTimeout(delayToAvoidCallTwice);
    };
  }, [iframe]);

  return (
    <>
      <button onClick={() => setShowConditionalStore(!showConditionalStore)}>
        Toggle conditional store
      </button>

      {showConditionalStore && (
        <useConditionalStore.Provider>
          <ConditionalComponent />
        </useConditionalStore.Provider>
      )}

      <br />

      <div>
        <input
          value={state.grocery}
          style={{
            color: "black",
          }}
          onChange={(event) => (state.grocery = event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              state.groceries.push(state.grocery);
              state.grocery = "";
            }
          }}
        />

        <ul>
          {state.groceries.map((grocery, index) => (
            <li key={index}>{grocery}</li>
          ))}
        </ul>
      </div>

      <div className="rounded overflow-hidden m-5 w-full">
        <iframe ref={iframe} width="100%" height="500px" src="/debugger" />
      </div>
    </>
  );
}

export function MobxExample() {
  const [foo, setFoo] = useState("hello");

  useEffect(() => {
    const interval = setInterval(
      () => setFoo((current) => current + "!"),
      1000,
    );

    return () => clearInterval(interval);
  }, []);

  return (
    <useStore.Provider foo={foo}>
      <App />
    </useStore.Provider>
  );
}
