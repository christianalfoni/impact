import React from "react";
import { createRoot } from "react-dom/client";
import {
  useStore,
  derived,
  effect,
  signal,
  createStoreProvider,
} from "impact-react";

import "impact-react-debugger";

function GlobalStore() {
  const count = signal(0);
  return {
    get count() {
      return count.value;
    },
    increaseCount() {
      return count.value++;
    },
  };
}

function MyStore({ message }: { message: string }) {
  const foo = signal(message);

  return {
    get foo() {
      return foo.value;
    },

    changeFoo() {
      foo.value += "!";
    },
  };
}

const MyStoreProvider = createStoreProvider(MyStore);

const root = createRoot(document.querySelector("#root")!);

const App = MyStoreProvider.provide(function App() {
  console.log("RENDER");

  const store = useStore(MyStore);

  return <h1 onClick={() => store.changeFoo()}>{store.foo}</h1>;
});

root.render(<App message="Hello" />);
