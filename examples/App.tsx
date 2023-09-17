import { Box, Flex } from "@radix-ui/themes";

import { Caching } from "./examples/caching";
import { globalHooks } from "./global-hooks";
import { ExampleLink } from "./ExampleLink";
import { VisibilityExample } from "./examples/visibility";
import { observe } from "../src/Signal";
import { RoutingExample } from "./examples/routing";

export function App() {
  using _ = observe();

  const router = globalHooks.useRouter();

  let content;

  if (!router.route) {
    return <Box>Route not found</Box>;
  }

  switch (router.route.name) {
    case "caching": {
      content = (
        <Caching
          example={router.route.params.example}
          onClickExample={(example) => {
            router.open({
              name: "caching",
              params: { example },
            });
          }}
        />
      );
      break;
    }
    case "visibility": {
      content = <VisibilityExample />;
      break;
    }
    case "routing": {
      content = <RoutingExample />;
    }
  }

  return (
    <Flex gap="4">
      <Flex p="4" direction="column">
        <ExampleLink name="caching" params={{ example: "1" }}>
          Caching
        </ExampleLink>
        <ExampleLink name="visibility" params={{}}>
          Visibility
        </ExampleLink>
        <ExampleLink name="routing" params={{ page: "page-a" }}>
          Routing
        </ExampleLink>
      </Flex>
      {content}
    </Flex>
  );
}
