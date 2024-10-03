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
  const [showConditionalStore, setShowConditionalStore] = useState(false);
  const state = useStore();

  return (
    <>
      <button onClick={() => setShowConditionalStore(!showConditionalStore)}>
        Toggle conditional store
      </button>

      <article>
        {showConditionalStore && (
          <useConditionalStore.Provider>
            <ConditionalComponent />
          </useConditionalStore.Provider>
        )}
      </article>

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
    </>
  );
}

export function MobxExample() {
  const iframe = useRef<HTMLIFrameElement>(null);
  const [foo, setFoo] = useState("hello");

  // useEffect(() => {
  //   const interval = setInterval(
  //     () => setFoo((current) => current + "!"),
  //     1000,
  //   );

  //   return () => clearInterval(interval);
  // }, []);

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
      <div>
        <useStore.Provider foo={foo}>
          <App />
        </useStore.Provider>
      </div>

      <div className="m-5 w-full overflow-hidden rounded">
        <iframe ref={iframe} width="100%" height="500px" src="/debugger" />
      </div>
    </>
  );
}
