import React from "react";
import { createRoot } from "react-dom/client";

import "impact-debugger";
import { useStore } from "./store";

const root = createRoot(document.querySelector("#root")!);

function Dev() {
  console.log("RENDER");
  const store = useStore();

  return (
    <h1 onClick={() => store.changeFoo()}>
      {store.foo}
      {store.upperFoo}
    </h1>
  );
}

function App() {
  return (
    <useStore.Provider>
      <Dev />
    </useStore.Provider>
  );
}

root.render(<App />);
