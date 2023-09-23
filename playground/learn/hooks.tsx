import { Flex, Heading, Text } from "@radix-ui/themes";
import { ExampleSandpack } from "../ExampleSandpack";

export function LearnHooks() {
  return (
    <Flex direction="column" gap="4" grow="1" pb="6">
      <Heading>Hooks</Heading>
      <Text>
        The fundamental primitive of Impact is the hook. This hook conceptually
        works the same way as traditional React hooks, but they run outside of
        the reconciliation loop of React. That means you can not use hooks like
        <b> useState</b>, <b>useEffect</b> etc., but you rather use reactive
        state primitives. Either from Impact or the ecosystem.
      </Text>
      <Text>
        The most important thing to understand about reactive hooks in Impact is
        that will by default be registered globally.
      </Text>
      <ExampleSandpack
        example={`import { Button, Flex } from "@radix-ui/themes";
import { useHelloWorld } from "./useHelloWorld";

function HelloWorld() {
  const helloWorld = useHelloWorld()

  return (
    <Flex p="6" gap="4" align="center">
      {helloWorld}
    </Flex>
  );
}

export default HelloWorld`}
        files={{
          "/useHelloWorld.js": `import { createHook } from "impact-app";

function HelloWorld() {
  return 'Hello World'
}

export const useHelloWorld = createHook(HelloWorld);`,
        }}
      />
      <Text>
        That means if we where to use multiple components consuming the hook,
        they would consume the same global instance. Let us move to a counter
        instead.
      </Text>
      <ExampleSandpack
        example={`import { Button, Flex } from "@radix-ui/themes";
import { useCounter } from "./useCounter";

function Counter() {
  const counter = useCounter()

  return (
    <Button onClick={() => counter.increase()}>
      Click to increase count and see the value
    </Button>
  );
}

function Counters() {
  return (
    <Flex gap="4" direction="column">
      <Counter />
      <Counter />
    </Flex>
  )
}

export default Counters`}
        files={{
          "/useCounter.js": `import { createHook } from "impact-app";

function Counter() {
  let count = 0

  return {
    increase() {
      count++
      alert(count)
    }
  }
}

export const useCounter = createHook(Counter);`,
        }}
      />
      <Text>
        Impact allows you to scope hooks to a component tree. Typically you
        would do this for pages or features within a page, but for this example
        lets us create a unique <b>Counter</b> hook for each component.
      </Text>
      <ExampleSandpack
        example={`import { Button, Flex } from "@radix-ui/themes";
import { createHooksProvider } from 'impact-app'
import { useCounter } from "./useCounter";

const CounterProvider = createHooksProvider({ useCounter })

function Counter() {
  const counter = useCounter()

  return (
    <Button onClick={() => counter.increase()}>
      Click to increase count and see the value
    </Button>
  );
}

function Counters() {
  return (
    <Flex gap="4" direction="column">
      <CounterProvider>
        <Counter />
      </CounterProvider>
      <CounterProvider>
        <Counter />
      </CounterProvider>
    </Flex>
  )
}

export default Counters`}
        files={{
          "/useCounter.js": `import { createHook } from "impact-app";

function Counter() {
  let count = 0

  return {
    increase() {
      count++
      alert(count)
    }
  }
}

export const useCounter = createHook(Counter);`,
        }}
      />
      <Text>
        In this scenario we just added a single hook to the provider, but you
        can add multiple hooks. What this also means is that hooks are resolved
        using the component tree. To understand this better, let us add a new
        hook that will be exposed at the top of the application.
      </Text>
      <ExampleSandpack
        example={`import { Button, Flex } from "@radix-ui/themes";
import { createHooksProvider } from 'impact-app'
import { useCounter } from "./useCounter";
import { useMath } from "./useMath";

const GlobalProvider = createHooksProvider({ useMath })
const CounterProvider = createHooksProvider({ useCounter })

function Counter() {
  const counter = useCounter()

  return (
    <Button onClick={() => counter.increase()}>
      Click to increase count and see the value
    </Button>
  );
}

function Counters() {
  return (
    <GlobalProvider>
      <Flex gap="4" direction="column">
        <CounterProvider>
          <Counter />
        </CounterProvider>
        <CounterProvider>
          <Counter />
        </CounterProvider>
      </Flex>
    </GlobalProvider>
  )
}

export default Counters`}
        files={{
          "/useCounter.js": `import { createHook } from "impact-app";
import { useMath } from './useMath';

function Counter() {
  const math = useMath()
  let count = 0

  return {
    increase() {
      count = math.add(count, 1)
      alert(count)
    }
  }
}

export const useCounter = createHook(Counter);`,
          "/useMath.js": `import { createHook } from "impact-app";

function Math() {
  return {
    add(valA, valB) {
      return valA + valB
    }
  }
}

export const useMath = createHook(Math)
`,
        }}
      />
      <Text>
        What to take notice of here is that our <b>useCounter</b> hook is
        consuming the <b>useMath</b> hook. Also notice that we are exposing the{" "}
        <b>useMath</b> hook at the top of the application on a provider. If you
        remove this provider the code will fail with an error message stating
        that the <b>Math</b> hook is not available.
      </Text>
      <Text>
        When using hook providers the hooks still run outside the component
        tree, but they are <b>resolved</b> through the component tree. This is
        what enables you to scope certain state and logic to specific pages and
        features of your application.
      </Text>
      <Text>
        With the scoping of hooks to component trees we also enable the
        possibility to instantiate hooks with an initial value. Let us extend
        our <b>Counter</b> hook to take an initial count.
      </Text>
      <ExampleSandpack
        example={`import { Button, Flex } from "@radix-ui/themes";
import { createHooksProvider } from 'impact-app'
import { useCounter } from "./useCounter";
import { useMath } from "./useMath";

const GlobalProvider = createHooksProvider({ useMath })
const CounterProvider = createHooksProvider({ useCounter })

function Counter() {
  const counter = useCounter()

  return (
    <Button onClick={() => counter.increase()}>
      Click to increase count and see the value
    </Button>
  );
}

function Counters() {
  return (
    <GlobalProvider>
      <Flex gap="4" direction="column">
        <CounterProvider useCounter={5}>
          <Counter />
        </CounterProvider>
        <CounterProvider useCounter={10}>
          <Counter />
        </CounterProvider>
      </Flex>
    </GlobalProvider>
  )
}

export default Counters`}
        files={{
          "/useCounter.js": `import { createHook } from "impact-app";
import { useMath } from './useMath';

function Counter(initialCount) {
  const math = useMath()
  let count = initialCount

  return {
    increase() {
      count = math.add(count, 1)
      alert(count)
    }
  }
}

export const useCounter = createHook(Counter);`,
          "/useMath.js": `import { createHook } from "impact-app";

function Math() {
  return {
    add(valA, valB) {
      return valA + valB
    }
  }
}

export const useMath = createHook(Math)
`,
        }}
      />
      <Text>
        Now you have the fundamental idea of what Impact enables. Now it is time
        to put some reactive primitives inside these hooks and explore some
        patterns for organising them.
      </Text>
    </Flex>
  );
}
