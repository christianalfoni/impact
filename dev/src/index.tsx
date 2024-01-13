import React from "react";
import { createRoot } from "react-dom/client";
import { globalStore } from "impact-app";

import "impact-debugger";

const root = createRoot(document.querySelector("#root")!);

const useTest = globalStore({
  foo: "bar",
  changeFoo() {
    console.log("CHANGE FOO");
    this.foo += "!";
  },
  get upperFoo() {
    return this.foo.toUpperCase();
  },
});

function Dev() {
  const test = useTest();

  return (
    <h1 onClick={() => test.changeFoo()}>
      {test.foo}
      {test.upperFoo}
    </h1>
  );
}

root.render(<Dev />);
