import { Callout, Flex, Heading, Text } from "@radix-ui/themes";
import { ExampleSandpack } from "../ExampleSandpack";
import { CheckCircledIcon } from "@radix-ui/react-icons";

export function LearnSignals() {
  return (
    <Flex direction="column" gap="4" grow="1" pb="6">
      <Heading>Signals</Heading>
      <Text>
        Impact ships with its own reactive primitives. One of those primitives
        is a <b>signal</b>. The signal allows you to consume state from stores
        and components can observe changes to them. Let us look at our message
        store again and make it reactive.
      </Text>
      <Callout.Root color="green">
        <Callout.Icon>
          <CheckCircledIcon />
        </Callout.Icon>
        <Callout.Text>
          In this example you will learn how to define a signal.
        </Callout.Text>
      </Callout.Root>
      <ExampleSandpack
        example={`import { Button, Flex, Heading } from "@radix-ui/themes";
import { observe, useStore } from "impact-app";
import { MessageStore } from "./MessageStore";

function HelloWorld() {
  const messageStore = useStore(MessageStore)

  return (
    <Flex p="6" gap="4" justify="center">
      <Heading>{messageStore.message}</Heading>
    </Flex>
  );
}

export default observe(HelloWorld);`}
        files={{
          "/MessageStore.js": `import { signal } from "impact-app";

export function MessageStore() {
  const message = signal("Hello World");

  return {
    get message() {
      return message.value;
    }
  }
}`,
        }}
      />
      <Text>
        First we used a <b>signal</b> to hold our reactive value. We returned
        the signals value using a <i>getter</i>. This makes our value{" "}
        <i>readonly</i> ensuring that we can only change the message from within
        the store.
      </Text>
      <Text>
        Additionally we are using the <b>observe</b> function to make our
        component able to observe any consumed signal from any store. You can
        also express this observability inline in the component, which you can
        read more about in the documentation.
      </Text>
      <Text>
        Now we can expose a method to change this message and our reactive
        circle is completely.
      </Text>
      <Callout.Root color="green">
        <Callout.Icon>
          <CheckCircledIcon />
        </Callout.Icon>
        <Callout.Text>
          In this example you will learn how to change a signal and observe
          those changes in a component.
        </Callout.Text>
      </Callout.Root>
      <ExampleSandpack
        example={`import { Button, Flex, Heading } from "@radix-ui/themes";
import { observe, useStore } from "impact-app";
import { MessageStore } from "./MessageStore";

function HelloWorld() {
  const messageStore = useStore(MessageStore)

  return (
    <Flex p="6" gap="4" justify="center" align="center" direction="column">
        <Heading>{messageStore.message}</Heading>
        <Button
            onClick={() => {
                messageStore.changeMessage()
            }}
        >
            Change message
        </Button>
    </Flex>
  );
}

export default observe(HelloWorld);`}
        files={{
          "/MessageStore.js": `import {  signal } from "impact-app";

export function MessageStore() {
  const message = signal("Hello World");

  return {
    get message() {
      return message.value;
    },
    changeMessage() {
        message.value = "Changed message";
    }
  }
}`,
        }}
      />
      <Text>
        You probably want to store more complex objects in a signal as well. For
        example an entity from the server. In this example we have a store
        representing the current project on a project page.
      </Text>
      <Callout.Root color="green">
        <Callout.Icon>
          <CheckCircledIcon />
        </Callout.Icon>
        <Callout.Text>
          In this example you will learn how to define complex objects in a
          signal and expose it to components and other stores.
        </Callout.Text>
      </Callout.Root>
      <ExampleSandpack
        example={`import { Button, Flex, Text, Heading } from "@radix-ui/themes";
import { observe, useStore } from "impact-app";
import { ProjectStore } from "./ProjectStore";

function Project() {
  const projectStore = useStore(ProjectStore)

  return (
    <Flex p="6" gap="4" align="center" direction="column">
        <Heading>{projectStore.title}</Heading>
        <Text>{projectStore.description}</Text>
    </Flex>
  );
}

export default observe(Project);`}
        files={{
          "/ProjectStore.js": `import { signal } from "impact-app";

export function ProjectStore() {
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
}`,
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
      <Callout.Root color="green">
        <Callout.Icon>
          <CheckCircledIcon />
        </Callout.Icon>
        <Callout.Text>
          In this example you will learn how to optimise component
          reconciliation using signals.
        </Callout.Text>
      </Callout.Root>
      <ExampleSandpack
        example={`import { Button, Flex, Text, Heading } from "@radix-ui/themes";
import { observe, useStore } from "impact-app";
import { ProjectStore } from "./ProjectStore";

const Title = observe(() => {
    const projectStore = useStore(ProjectStore)
    console.log("Render title")
    return <Heading>{projectStore.title}</Heading>
})

const Description = observe(() => {
    const projectStore = useStore(ProjectStore)
    console.log("Render description")
    return <Text>{projectStore.description}</Text>
})

function Project() {
    const projectStore = useStore(ProjectStore)

    return (
        <Flex p="6" gap="4" align="center" direction="column">
            <Title />
            <Description />
            <Button onClick={() => projectStore.changeTitle()}>Change title</Button>
            <Button onClick={() => projectStore.changeDescription()}>Change description</Button>
        </Flex>
    );
}

export default Project;`}
        files={{
          "/ProjectStore.js": `import { signal } from "impact-app";

          
export function ProjectStore() {
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
}`,
        }}
      />
      <Text>
        When you now change the title only the <b>Title</b> component will
        reconcile (Note! It does this twice in development due to Strict Mode).
      </Text>
    </Flex>
  );
}
