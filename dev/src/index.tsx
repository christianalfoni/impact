import React from "react";
import { createRoot } from "react-dom/client";
import {
  ObserverContext,
  context,
  derived,
  effect,
  globalStore,
  signal,
} from "impact-app";

import "impact-debugger";

const root = createRoot(document.querySelector("#root")!);

const useTest = context(() => {
  const foo = signal("bar");
  const upperFoo = derived(function UpperFoo() {
    return foo.value.toUpperCase();
  });

  effect(function LogFoo() {
    console.log(foo.value);
  });

  return {
    get foo() {
      return foo.value;
    },
    get upperFoo() {
      return upperFoo.value;
    },
    changeFoo() {
      foo.value += "!";
    },
  };
});

function Dev() {
  console.log("RENDER");
  const test = useTest();

  return (
    <h1 onClick={() => test.changeFoo()}>
      {test.foo}
      {test.upperFoo}
    </h1>
  );
}

function App() {
  return (
    <useTest.Provider>
      <Dev />
    </useTest.Provider>
  );
}

root.render(<App />);
