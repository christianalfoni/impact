import { Callout, Flex, Heading, Text } from "@radix-ui/themes";
import { ExampleSandpack } from "../ExampleSandpack";
import { CheckCircledIcon, InfoCircledIcon } from "@radix-ui/react-icons";

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
      <Callout.Root color="green">
        <Callout.Icon>
          <CheckCircledIcon />
        </Callout.Icon>
        <Callout.Text>
          In this example you will learn about defining and consuming hooks.
        </Callout.Text>
      </Callout.Root>
      <ExampleSandpack
        example={`import { Button, Flex, Heading } from "@radix-ui/themes";
import { useHelloWorld } from "./useHelloWorld";

function HelloWorld() {
  const helloWorld = useHelloWorld()

  return (
    <Flex p="6" justify="center">
      <Heading>{helloWorld}</Heading>
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
      <Callout.Root color="green">
        <Callout.Icon>
          <CheckCircledIcon />
        </Callout.Icon>
        <Callout.Text>
          In this example you will learn that multiple components consumes the
          same instance of a hook.
        </Callout.Text>
      </Callout.Root>
      <ExampleSandpack
        example={`import { Button, Flex, Heading } from "@radix-ui/themes";
import { useCounter } from "./useCounter";

function Counter({ name }) {
  const counter = useCounter()

  return (
    <>
      <Heading size="4">{name}</Heading>
      <Button onClick={() => counter.increase()}>
        Increase count
      </Button>
    </>
  );
}

function Counters() {
  return (
    <Flex gap="4" p="6" direction="column">
      <Counter name="Counter 1" />
      <Counter name="Counter 2" />
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
      <Callout.Root color="green">
        <Callout.Icon>
          <CheckCircledIcon />
        </Callout.Icon>
        <Callout.Text>
          In this example you will learn about hook providers, which allows you
          to scope hooks to component trees. Now each component tree has its own
          instance of the hook.
        </Callout.Text>
      </Callout.Root>
      <ExampleSandpack
        example={`import { Button, Flex, Heading } from "@radix-ui/themes";
import { createHooksProvider } from 'impact-app'
import { useCounter } from "./useCounter";

const CounterProvider = createHooksProvider({ useCounter })

function Counter({ name }) {
  const counter = useCounter()

  return (
    <>
      <Heading size="4">{name}</Heading>
      <Button onClick={() => counter.increase()}>
        Increase count
      </Button>
    </>
  );
}

function Counters() {
  return (
    <Flex gap="4" p="6" direction="column">
      <CounterProvider>
        <Counter name="Counter 1" />
      </CounterProvider>
      <CounterProvider>
        <Counter name="Counter 2" />
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
      <Callout.Root color="green">
        <Callout.Icon>
          <CheckCircledIcon />
        </Callout.Icon>
        <Callout.Text>
          In this example you will learn that hooks are resolved through the
          component tree. That means hooks can user other hooks, but only if
          they can be resolved through the component tree.
        </Callout.Text>
      </Callout.Root>
      <ExampleSandpack
        example={`import { Button, Flex, Heading } from "@radix-ui/themes";
import { createHooksProvider } from 'impact-app'
import { useCounter } from "./useCounter";
import { useMath } from "./useMath";

const GlobalProvider = createHooksProvider({ useMath })
const CounterProvider = createHooksProvider({ useCounter })

function Counter({ name }) {
  const counter = useCounter()

  return (
    <>
      <Heading size="4">{name}</Heading>
      <Button onClick={() => counter.increase()}>
        Increase count
      </Button>
    </>
  );
}

function Counters() {
  return (
    <GlobalProvider>
      <Flex gap="4" p="6" direction="column">
        <CounterProvider>
          <Counter name="Counter 1" />
        </CounterProvider>
        <CounterProvider>
          <Counter name="Counter 2" />
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
      <Callout.Root color="green">
        <Callout.Icon>
          <CheckCircledIcon />
        </Callout.Icon>
        <Callout.Text>
          In this example you will learn that hooks exposed through a hooks
          provider can be instantiated with initial values.
        </Callout.Text>
      </Callout.Root>
      <ExampleSandpack
        example={`import { Button, Flex, Heading } from "@radix-ui/themes";
import { createHooksProvider } from 'impact-app'
import { useCounter } from "./useCounter";
import { useMath } from "./useMath";

const GlobalProvider = createHooksProvider({ useMath })
const CounterProvider = createHooksProvider({ useCounter })

function Counter({ name }) {
  const counter = useCounter()

  return (
    <>
      <Heading size="4">{name}</Heading>
      <Button onClick={() => counter.increase()}>
        Increase count
      </Button>
    </>
  );
}

function Counters() {
  return (
    <GlobalProvider>
      <Flex gap="4" p="6" direction="column">
        <CounterProvider useCounter={5}>
          <Counter name="Counter 1" />
        </CounterProvider>
        <CounterProvider useCounter={10}>
          <Counter name="Counter 2" />
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
