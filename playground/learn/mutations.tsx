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
        components. We will just refetch the project when the mutation is done
      </LearnCallout>
      <ExampleSandpack
        example={`import { Flex, Heading, Button } from '@radix-ui/themes';
import { useEffect } from 'react';
import { useApi } from './useApi';
        
function App() {
    const id = '123';
    const api = useApi()
    const projectState = api.projects.fetch(id)
    const changeProjectTitleState = api.changeProjectTitle.subscribe(id)

    useEffect(() => {
        if (changeProjectTitleState.status === 'fulfilled') {
            api.projects.refetch(id)
        }
    }, [changeProjectTitleState])

    if (projectState.status === 'pending') {
        return <div>Loading...</div>
    }

    if (projectState.status === 'rejected') {
        return <div>Error: \${projectState.reason}</div>
    }

    const project = projectState.value

    return (
        <Flex align="center" p="6" direction="column" gap="4">
            <Heading>{project.title}</Heading>
            <Button
                disabled={changeProjectTitleState.status === 'pending' || projectState.isRefetching}
                onClick={() => {
                    api.changeProjectTitle.mutate('123', "Well, this is an awesome title")
                }}
            >
                Change title
            </Button>
            {changeProjectTitleState.status === 'error' && (
                <Text>
                    There was an error changing the title: {changeProjectTitleState.reason}
                </Text>
            )}
        </Flex>
    )
}

export default App;`}
        files={{
          "/useApi.js": `import { queries, mutations, createStore } from "impact-app";
import { getProject, changeProjectTitle } from './api'

function Api() {
    
    
    return {
        projects: queries((id) =>
            getProject(id)
        ),
        changeProjectTitle: mutations((id, newTitle) =>
            changeProjectTitle(id, newTitle)
        )
    }
}

export const useApi = createStore(Api);`,
        }}
      />
      <Text>
        As you can see we are handling all the async state complexity of both
        loading the project, changing the title and refetching the project.
      </Text>
    </Flex>
  );
}
