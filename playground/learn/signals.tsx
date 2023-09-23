import { Flex, Heading, Text } from "@radix-ui/themes";
import { ExampleSandpack } from "../ExampleSandpack";

export function LearnSignals() {
  return (
    <Flex direction="column" gap="4" grow="1" pb="6">
      <Heading>Signals</Heading>
      <Text>
        Impact ships with its own reactive primitives. One of those primitives
        is a <b>signal</b>. The signal allows you to consume state from hooks
        and components can observe changes to them. Let us look at our message
        hook again and make it reactive.
      </Text>
      <ExampleSandpack
        example={`import { Button, Flex } from "@radix-ui/themes";
import { observe } from "impact-app";
import { useHelloWorld } from "./useHelloWorld";

function HelloWorld() {
  const helloWorld = useHelloWorld()

  return (
    <Flex p="6" gap="4" align="center">
      {helloWorld.message}
    </Flex>
  );
}

export default observe(HelloWorld);`}
        files={{
          "/useHelloWorld.js": `import { createHook, signal } from "impact-app";

function HelloWorld() {
  const message = signal("Hello World");

  return {
    get message() {
      return message.value;
    }
  }
}

export const useHelloWorld = createHook(HelloWorld);`,
        }}
      />
      <Text>
        First we used a <b>signal</b> to hold our reactive value. We returned
        the signals value using a <i>getter</i>. This makes our value{" "}
        <i>readonly</i> ensuring that we can only change the message from within
        the hook.
      </Text>
      <Text>
        Additionally we are using the <b>observe</b> function to make our
        component able to observe any consumed signal from any hook. You can
        also express this observability inline in the component, which you can
        read more about in the documentation.
      </Text>
      <Text>
        Now we can expose a method to change this message and our reactive
        circle is completely.
      </Text>
      <ExampleSandpack
        example={`import { Button, Flex } from "@radix-ui/themes";
import { observe } from "impact-app";
import { useHelloWorld } from "./useHelloWorld";

function HelloWorld() {
  const helloWorld = useHelloWorld()

  return (
    <Flex p="6" gap="4" align="center" direction="column">
        {helloWorld.message}
        <Button
            onClick={() => {
                helloWorld.changeMessage()
            }}
        >
            Change message
        </Button>
    </Flex>
  );
}

export default observe(HelloWorld);`}
        files={{
          "/useHelloWorld.js": `import { createHook, signal } from "impact-app";

function HelloWorld() {
  const message = signal("Hello World");

  return {
    get message() {
      return message.value;
    },
    changeMessage() {
        message.value = "Changed message";
    }
  }
}

export const useHelloWorld = createHook(HelloWorld);`,
        }}
      />
      <Text>
        You probably want to store more complex objects in a signal as well. For
        example an entity from the server. In this example we have a hook
        representing the current project on a project page.
      </Text>
      <ExampleSandpack
        example={`import { Button, Flex, Text } from "@radix-ui/themes";
import { observe } from "impact-app";
import { useProject } from "./useProject";

function Project() {
  const project = useProject()

  return (
    <Flex p="6" gap="4" align="center" direction="column">
        <Text>{project.title}</Text>
        <Text>{project.description}</Text>
    </Flex>
  );
}

export default observe(Project);`}
        files={{
          "/useProject.js": `import { createHook, signal } from "impact-app";

function Project() {
  const project = signal({
    title: "My awesome project",
    description: "This project is truly the most awesome thing ever"
  });

  return {
    get title() {
        return project.value.title
    },
    get description() {
        return project.value.description
    }
  }
}

export const useProject = createHook(Project);`,
        }}
      />
      <Text>
        Again we are using <i>getters</i> to naturally consume the details of
        our project. Now we can add methods to change the state of the project,
        but we can also decide to split up the project into multiple signals.
      </Text>
      <Text>
        Imagine your project page is consuming details from the project "all
        over the place". You want to avoid every single component to reconcile
        when changing for example the title. Only the components consuming the
        title should reconcile. Let us split up the project into two signals.
      </Text>
      <ExampleSandpack
        example={`import { Button, Flex, Text } from "@radix-ui/themes";
import { observe } from "impact-app";
import { useProject } from "./useProject";

const Title = observe(() => {
    const project = useProject()
    console.log("Render title")
    return <Text>{project.title}</Text>
})

const Description = observe(() => {
    const project = useProject()
    console.log("Render description")
    return <Text>{project.description}</Text>
})

function Project() {
    const project = useProject()

    return (
        <Flex p="6" gap="4" align="center" direction="column">
            <Title />
            <Description />
            <Button onClick={() => project.changeTitle()}>Change title</Button>
            <Button onClick={() => project.changeDescription()}>Change description</Button>
        </Flex>
    );
}

export default Project;`}
        files={{
          "/useProject.js": `import { createHook, signal } from "impact-app";

          
function Project() {
  const title = signal("My awesome project")
  const description = signal("My even more awesome description")

  return {
    get title() {
        return title.value
    },
    get description() {
        return description.value
    },
    changeTitle() {
        title.value = "My new project title";
    },
    changeDescription() {
        description.value = "Just changing up the description";
    }
  }
}

export const useProject = createHook(Project);`,
        }}
      />
      <Text>
        When you now change the title only the <b>Title</b> component will
        reconcile (Note! It does this twice in development due to Strict Mode).
      </Text>
    </Flex>
  );
}
