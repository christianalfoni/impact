import { Callout, Flex, Heading, Text } from "@radix-ui/themes";
import { ExampleSandpack } from "../ExampleSandpack";
import { CheckCircledIcon } from "@radix-ui/react-icons";

export function LearnQueries() {
  return (
    <Flex direction="column" gap="4" grow="1" pb="6">
      <Heading>Queries</Heading>
      <Text>
        Data fetching at its core is just a request and response encapsulated by
        a promise. But data fetching is more than that. You have to consider
        things like caching, but importantly how you want to consume the state
        of the data fetching.
      </Text>
      <Text>
        Impact gives you a primitive to manage your data fetching with an
        accessible API surface for dealing with different scenarios.
      </Text>
      <Callout.Root color="green">
        <Callout.Icon>
          <CheckCircledIcon />
        </Callout.Icon>
        <Callout.Text>
          In this example you will learn how to define queries.
        </Callout.Text>
      </Callout.Root>
      <ExampleSandpack
        example={`import { queries, createHook } from "impact-app";

function Api() {
    return {
        projects: queries((id) =>
            fetch('/projects/' + id)
                .then((response) => response.json())
        )
    }
}

const useApi = createHook(Api);

export default function App() {
    return null
}`}
        files={{}}
      />
    </Flex>
  );
}
