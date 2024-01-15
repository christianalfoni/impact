import React from "react";
import { createRoot } from "react-dom/client";
import { globalStore } from "impact-app";

import "impact-debugger";

const root = createRoot(document.querySelector("#root")!);

const useTest = globalStore({
  foo: "bar",
  mip: {
    foo: "bar",
    bar: "baz",
  },
  changeFoo() {
    this.foo += "!";
    this.mip = {
      foo: "bar2",
      bar: "baz2",
    };
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
