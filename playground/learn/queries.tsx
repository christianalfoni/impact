import { Flex, Heading, Text } from "@radix-ui/themes";
import { ExampleSandpack } from "../ExampleSandpack";
import { LearnCallout } from "../LearnCallout";

export function LearnQueries() {
  return (
    <Flex direction="column" gap="4" grow="1" pb="6">
      <Heading>Queries</Heading>
      <Text>
        Data fetching at its core is just a request and response encapsulated by
        a promise. But data fetching is more than that. You have to consider
        things like caching, but more importantly how you want to consume the
        state of the data fetching to produce the user experience.
      </Text>
      <Text>
        Impact gives you a primitive to manage your data fetching with an
        accessible API surface for dealing with different scenarios.
      </Text>
      <LearnCallout>
        In this example you will learn how to define queries and consume
        queries.
      </LearnCallout>
      <ExampleSandpack
        example={`import { useStore } from "impact-app";
import { Flex, Heading } from '@radix-ui/themes';
import { ApiStore } from './ApiStore';
        
function App() {
  const apiStore = useStore(ApiStore)
  const projectQuery = apiStore.projects.fetch('123')

  if (projectQuery.status === 'pending') {
    return <div>Loading...</div>
  }

  if (projectQuery.status === 'rejected') {
    return <div>Error: \${projectQuery.reason}</div>
  }

  const project = projectQuery.value

  return (
    <Flex justify="center" p="6">
      <Heading>{project.title}</Heading>
    </Flex>
  )
}

export default App;`}
        files={{
          "/ApiStore.js": `import { queries } from "impact-app";
import { getProject } from './api'

export function ApiStore() {
    return {
        projects: queries((id) =>
            getProject(id)
        )
    }
}`,
        }}
      />
      <Text>
        <b>Queries</b> allows you to define a callback which fetches data. The
        first argument has to be a string or an array of string, number and/or
        boolean. This acts as the unique identifier for the query and its cache.
      </Text>
      <Text>
        All queries are cached and to update them you have to call{" "}
        <b>refetch</b>
      </Text>
      <LearnCallout>
        In this example you will learn how to use refetch to update a query.
      </LearnCallout>
      <ExampleSandpack
        example={`import { useStore } from "impact-app";
import { Flex, Heading, Button, Text } from '@radix-ui/themes';
import { ApiStore } from './ApiStore';
        
function App() {
  const apiStore = useStore(ApiStore)
  const projectQuery = apiStore.projects.fetch('123')

  if (projectQuery.status === 'pending') {
    return <div>Loading...</div>
  }

  if (projectQuery.status === 'rejected') {
    return <div>Error: \${projectQuery.reason}</div>
  }

  const project = projectQuery.value

  return (
    <Flex align="center" p="6" direction="column" gap="4">
      <Heading>{project.title}</Heading>
      <Text>{project.updatedAt}</Text>
      <Button
        disabled={projectQuery.isRefetching}
        onClick={() => {
          api.projects.refetch('123')
        }}
      >
        Refetch
      </Button>
    </Flex>
  )
}

export default App;`}
        files={{
          "/ApiStore.js": `import { queries } from "impact-app";
import { getProject } from './api'

export function ApiStore() {
    return {
        projects: queries((id) =>
            getProject(id)
        )
    }
}`,
        }}
      />
      <Text>
        You can also use <b>suspend</b> to consume the query. This requires a
        suspense and optionally an error boundary to handle errors.
      </Text>
      <LearnCallout>
        In this example you will learn how to use suspense to consume a query.
      </LearnCallout>
      <ExampleSandpack
        example={`import { Flex, Heading, Button, Text } from '@radix-ui/themes';
import { useStore } from "impact-app";
import { Suspense } from 'react';
import { ApiStore } from './ApiStore';
        
function Project() {
  const apiStore = useStore(ApiStore)
  const project = apiStore.projects.suspend('123')

  return (
    <Flex align="center" p="6" direction="column" gap="4">
      <Heading>{project.title}</Heading>
    </Flex>
  )
}

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Project />
    </Suspense>
  )
}

export default App;`}
        files={{
          "/ApiStore.js": `import { queries } from "impact-app";
import { getProject } from './api'

export function ApiStore() {
    return {
        projects: queries((id) =>
            getProject(id)
        )
    }
}`,
        }}
      />
    </Flex>
  );
}
