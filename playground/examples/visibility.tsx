import { Flex, Heading, Text } from "@radix-ui/themes";
import { ExampleSandpack } from "../ExampleSandpack";

export function VisibilityExample() {
  return (
    <Flex direction="column" gap="4" grow="1">
      <Heading>Visibility</Heading>
      <Text>
        In this example we create a store for the visibility API of the browser.
      </Text>
      <ExampleSandpack
        example={`import { observe } from "impact-app";
import { useEffect, useState } from 'react'
import { useVisbility } from './useVisbility'

function Example() {
  const visibility = useVisbility();
  const [log, setLog] = useState([])

  useEffect(() => visibility.onChange((isVisible) => {
    setLog(current => current.concat(String(isVisible)))
  }), []);

  return (
    <div>
      <div>
        Are we visible? {visibility.isVisible ? "YEAH" : "NO"}
      </div>
      <div>
        Log:
        {log.map((message, index) => <div key={index}>{message}</div>)}
      </div>
    </div>
  );
}

export default observe(Example)`}
        files={{
          "/useVisbility.js": `import { useCleanup, createStore, emitter, signal } from "impact-app"
          
function Visibility() {
  const isVisible = signal(document.visibilityState === "visible");
  const visibilityEmitter = emitter();
  const visibilityListener = () => {
    isVisible.value = document.visibilityState === "visible";
    visibilityEmitter.emit(isVisible.value);
  };

  document.addEventListener("visibilitychange", visibilityListener);

  useCleanup(() => {
    document.removeEventListener("visibilitychange", visibilityListener);
  });

  return {
    get isVisible() {
      return isVisible.value;
    },
    onChange: visibilityEmitter.on,
  };
}

export const useVisbility = createStore(Visibility);`,
        }}
      />
    </Flex>
  );
}
