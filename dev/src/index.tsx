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

function MyStore({ message }: { message: string }) {
  const foo = signal(message);
  const obj = signal({});
  const upperFoo = derived(function UpperFoo() {
    return foo.value.toUpperCase();
  });

  const reallyLongFunctionNameForTesting = derived(
    function reallyLongFunctionNameForTestingTest() {
      obj.value["foo"] = "bar";

      return obj.value;
    },
  );

  effect(function LogFoo() {
    console.log(foo.value, reallyLongFunctionNameForTesting);
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
      const newObjt = { ...obj.value, anotherValue: "baz" };
      obj.value = newObjt;
    },
  };
}

const MyStoreProvider = createStoreProvider(MyStore);

const root = createRoot(document.querySelector("#root")!);

const App = MyStoreProvider.provide(function App() {
  console.log("RENDER");
  const store = useStore(MyStore);

  return (
    <h1 onClick={() => store.changeFoo()}>
      {store.foo}
      {store.foo}
      {store.upperFoo}
    </h1>
  );
});

root.render(<App message="Hello" />);
