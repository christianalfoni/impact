import { Flex, Heading, Text } from "@radix-ui/themes";
import { ExampleSandpack } from "../ExampleSandpack";
import { LearnCallout } from "../LearnCallout";

export function LearnMutations() {
  return (
    <Flex direction="column" gap="4" grow="1" pb="6">
      <Heading>Mutations</Heading>
      <Text>
        On the other side of consuming data from the server, you have changing
        data on the server. Still managed by a promise it has different
        consumption requirements than fetching data.
      </Text>
      <Text>
        First of all you want to be able to change server data both from
        components and from other stores.
      </Text>
      <LearnCallout>
        In this example you will learn how to define mutations and use them in
        components. We will just refetch the project when the mutation is done.
        This example aims to show all the complexity of data fetching and
        mutations working together.
      </LearnCallout>
      <ExampleSandpack
        example={`import { Flex, Heading, Button } from '@radix-ui/themes';
import { useStore } from "impact-app";
import { useEffect } from 'react';
import { ApiStore } from './ApiStore';
        
function App() {
    const id = '123';
    const apiStore = useStore(ApiStore)
    const projectQuery = apiStore.projects.fetch(id)
    const changeProjectTitleMutation = apiStore.changeProjectTitle.subscribe(id)

    useEffect(() => {
        if (changeProjectTitleMutation.status === 'fulfilled') {
            apiStore.projects.refetch(id)
        }
    }, [changeProjectTitleMutation])

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
            <Button
                disabled={changeProjectTitleMutation.status === 'pending' || projectQuery.isRefetching}
                onClick={() => {
                    api.changeProjectTitle.mutate('123', "Well, this is an awesome title")
                }}
            >
                Change title
            </Button>
            {changeProjectTitleMutation.status === 'error' && (
                <Text>
                    There was an error changing the title: {changeProjectTitleMutation.reason}
                </Text>
            )}
        </Flex>
    )
}

export default App;`}
        files={{
          "/ApiStore.js": `import { queries, mutations } from "impact-app";
import { getProject, changeProjectTitle } from './api'

export function ApiStore() {
    return {
        projects: queries((id) =>
            getProject(id)
        ),
        changeProjectTitle: mutations((id, newTitle) =>
            changeProjectTitle(id, newTitle)
        )
    }
}`,
        }}
      />
      <Text>
        As you can see we are handling all the async state complexity of both
        loading the project, changing the title and refetching the project.
      </Text>
    </Flex>
  );
}
