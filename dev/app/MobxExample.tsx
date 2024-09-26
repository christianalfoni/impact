"use client";

import { createStore } from "@impact-react/mobx";
import { connectDebuggerBridge } from "impact-react-debugger";
import { observable } from "mobx";

import { useEffect, useRef } from "react";

type State = { groceries: string[]; grocery: string };

const useStore = createStore(function Store() {
  const state = observable<State>({
    groceries: [],
    grocery: "",
  });

  return state;
});

const App = useStore.provider(function App() {
  const iframe = useRef<HTMLIFrameElement>(null);
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
});

export function MobxExample() {
  return <App />;
}
