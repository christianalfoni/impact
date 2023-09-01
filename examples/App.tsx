import { Box, Flex } from "@radix-ui/themes";

import { Caching } from "./examples/caching";
import { commonHooks } from "./common-hooks";
import { ExampleLink } from "./ExampleLink";
import { createHook } from "impact-app";


export function App() {
  using router = commonHooks.useRouter()

  let content

  if (!router.route) {
    return <Box>Route not found</Box>
  }

  switch (router.route.name) {
    case 'caching': {
      content = <Caching example={router.route.params.example} onClickExample={(example) => {
        router.open({
          name: 'caching',
          params: { example }
        })
      }} />
    }
  }

  return (
    <Flex gap="4">
      <Flex p="4" direction="column">
      <ExampleLink name="caching" params={{ example: "1" }}>
        Caching
      </ExampleLink>
      </Flex>
      {content}
    </Flex>
  );
}
