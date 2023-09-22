import { createHooksProvider } from "impact-app";
import { Sandpack } from "@codesandbox/sandpack-react";
import { Flex, Heading, Text } from "@radix-ui/themes";

export function VisibilityExample() {
  return (
    <Flex direction="column" gap="4">
      <Heading>Visibility</Heading>
      <Text>
        In this example we create a hook for the visibility API of the browser.
      </Text>
      <Sandpack
        template="react"
        theme="light"
        options={{
          showNavigator: true,
          showLineNumbers: true,
          showTabs: true,
          closableTabs: true,
        }}
        customSetup={{
          dependencies: {
            "impact-app": "latest",
          },
        }}
        files={{
          "/node_modules/stacktrace-gps/stacktrace-gps.js": {
            hidden: true,
            code: `export default class Fake { pinpoint() { return Promise.resolve({ setFunctionName() {} })} }`,
          },
          "/useVisbility.js": `import { useCleanup, createHook, emitter, signal } from "impact-app"
          
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

export const useVisbility = createHook(Visibility);`,
          "/App.js": `import { observe } from "impact-app";
import { useEffect } from 'react'
import { useVisbility } from './useVisbility'

function Example() {
  const visibility = useVisbility();

  useEffect(() => visibility.onChange(console.log), []);

  return (
    <div>
      <div>
        Are we visible? {visibility.isVisible ? "YEAH" : "NO"}
      </div>
      <div>
        <div>Check the console to see the event</div>
      </div>
    </div>
  );
}

export default observe(Example)`,
        }}
      />
    </Flex>
  );
}

/**
 
    const promise = StatePromise.from(somePromise)

    const value = useSuspendPromise(promise)

    function Mycomponent() {
      const api = useApi()
      const { status, data, mutate } = useSubscribePromise(api.renameSandbox)

      if (promise.state === 'resolved')

      if (promise.state === 'rejected')

      onClick={() =>  {
        mutate()
      }}
    }



 */
