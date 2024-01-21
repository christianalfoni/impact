import React from "react";
import { createRoot } from "react-dom/client";
import {
  ObserverContext,
  context,
  derived,
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

  setTimeout(function timeout() {
    console.log("TIMEOUT", ObserverContext.current);
    foo.value += "!";
    console.log("Get derived");
    const mip = upperFoo.value;
    console.log(mip);
  }, 1000);

  return {
    get foo() {
      return foo.value;
    },
    get upperFoo() {
      return upperFoo.value;
    },
  };
});

function Dev() {
  console.log("RENDER");
  const test = useTest();

  return <h1>{test.upperFoo}</h1>;
}

function App() {
  return (
    <useTest.Provider>
      <Dev />
    </useTest.Provider>
  );
}

root.render(<App />);
