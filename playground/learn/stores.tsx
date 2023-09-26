import { Callout, Flex, Heading, Text } from "@radix-ui/themes";
import { ExampleSandpack } from "../ExampleSandpack";
import { CheckCircledIcon } from "@radix-ui/react-icons";

export function LearnStores() {
  return (
    <Flex direction="column" gap="4" grow="1" pb="6">
      <Heading>Stores</Heading>
      <Text>
        The fundamental primitive of Impact is the store. This store is just a
        function exposing a public interface. That interface exposing reactive
        state or not is up to you.
      </Text>
      <Text>
        The most important thing to understand about stores in Impact is that
        will by default be registered globally.
      </Text>
      <Callout.Root color="green">
        <Callout.Icon>
          <CheckCircledIcon />
        </Callout.Icon>
        <Callout.Text>
          In this example you will learn about defining and consuming stores.
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
          "/useHelloWorld.js": `import { createStore } from "impact-app";

function HelloWorld() {
  return 'Hello World'
}

export const useHelloWorld = createStore(HelloWorld);`,
        }}
      />
      <Text>
        That means if we where to use multiple components consuming the store,
        they would consume the same global instance. Let us move to a counter
        instead.
      </Text>
      <Callout.Root color="green">
        <Callout.Icon>
          <CheckCircledIcon />
        </Callout.Icon>
        <Callout.Text>
          In this example you will learn that multiple components consumes the
          same instance of a store.
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
          "/useCounter.js": `import { createStore } from "impact-app";

function Counter() {
  let count = 0

  return {
    increase() {
      count++
      alert(count)
    }
  }
}

export const useCounter = createStore(Counter);`,
        }}
      />
      <Text>
        Impact allows you to scope stores to a component tree. Typically you
        would do this for pages or features within a page, but for this example
        lets us create a unique <b>Counter</b> store for each component.
      </Text>
      <Callout.Root color="green">
        <Callout.Icon>
          <CheckCircledIcon />
        </Callout.Icon>
        <Callout.Text>
          In this example you will learn about store providers, which allows you
          to scope stores to component trees. Now each component tree has its
          own instance of the store.
        </Callout.Text>
      </Callout.Root>
      <ExampleSandpack
        example={`import { Button, Flex, Heading } from "@radix-ui/themes";
import { createStoresProvider } from 'impact-app'
import { useCounter } from "./useCounter";

const CounterProvider = createStoresProvider({ useCounter })

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
          "/useCounter.js": `import { createStore } from "impact-app";

function Counter() {
  let count = 0

  return {
    increase() {
      count++
      alert(count)
    }
  }
}

export const useCounter = createStore(Counter);`,
        }}
      />
      <Text>
        In this scenario we just added a single store to the provider, but you
        can add multiple stores. What this also means is that stores are
        resolved using the component tree. To understand this better, let us add
        a new store that will be exposed at the top of the application.
      </Text>
      <Callout.Root color="green">
        <Callout.Icon>
          <CheckCircledIcon />
        </Callout.Icon>
        <Callout.Text>
          In this example you will learn that stores are resolved through the
          component tree. That means stores can user other stores, but only if
          they can be resolved through the component tree.
        </Callout.Text>
      </Callout.Root>
      <ExampleSandpack
        example={`import { Button, Flex, Heading } from "@radix-ui/themes";
import { createStoresProvider } from 'impact-app'
import { useCounter } from "./useCounter";
import { useMath } from "./useMath";

const GlobalProvider = createStoresProvider({ useMath })
const CounterProvider = createStoresProvider({ useCounter })

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
          "/useCounter.js": `import { createStore } from "impact-app";
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

export const useCounter = createStore(Counter);`,
          "/useMath.js": `import { createStore } from "impact-app";

function Math() {
  return {
    add(valA, valB) {
      return valA + valB
    }
  }
}

export const useMath = createStore(Math)
`,
        }}
      />
      <Text>
        What to take notice of here is that our <b>useCounter</b> store is
        consuming the <b>useMath</b> store. Also notice that we are exposing the{" "}
        <b>useMath</b> store at the top of the application on a provider. If you
        remove this provider the code will fail with an error message stating
        that the <b>Math</b> store is not available.
      </Text>
      <Text>
        When using store providers the stores still run outside the component
        tree, but they are <b>resolved</b> through the component tree. This is
        what enables you to scope certain state and logic to specific pages and
        features of your application.
      </Text>
      <Text>
        With the scoping of stores to component trees we also enable the
        possibility to instantiate stores with an initial value. Let us extend
        our <b>Counter</b> store to take an initial count.
      </Text>
      <Callout.Root color="green">
        <Callout.Icon>
          <CheckCircledIcon />
        </Callout.Icon>
        <Callout.Text>
          In this example you will learn that stores exposed through a stores
          provider can be instantiated with initial values.
        </Callout.Text>
      </Callout.Root>
      <ExampleSandpack
        example={`import { Button, Flex, Heading } from "@radix-ui/themes";
import { createStoresProvider } from 'impact-app'
import { useCounter } from "./useCounter";
import { useMath } from "./useMath";

const GlobalProvider = createStoresProvider({ useMath })
const CounterProvider = createStoresProvider({ useCounter })

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
          "/useCounter.js": `import { createStore } from "impact-app";
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

export const useCounter = createStore(Counter);`,
          "/useMath.js": `import { createStore } from "impact-app";

function Math() {
  return {
    add(valA, valB) {
      return valA + valB
    }
  }
}

export const useMath = createStore(Math)
`,
        }}
      />
      <Text>
        Now you have the fundamental idea of what Impact enables. Now it is time
        to put some reactive primitives inside these stores and explore some
        patterns for organising them.
      </Text>
    </Flex>
  );
}
