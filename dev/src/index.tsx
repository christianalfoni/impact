import React from "react";
import { createRoot } from "react-dom/client";
import { globalStore } from "impact-app";

import "impact-debugger";

const root = createRoot(document.querySelector("#root")!);

let count = 0;
const useTest = globalStore({
  runDerived: false,
  foo: "foo",
  run() {
    count++;
    if (count === 1) {
      this.foo += "!";
    } else if (count === 2) {
      this.runDerived = true;
    }
  },
  get upperFoo() {
    return this.foo.toUpperCase();
  },
});

function Dev() {
  const test = useTest();

  return (
    <h1 onClick={() => test.run()}>
      {test.foo}
      {test.runDerived ? test.upperFoo : null}
    </h1>
  );
}

root.render(<Dev />);
