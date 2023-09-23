import { Box, Flex, Heading } from "@radix-ui/themes";

import { DataFetchingExample } from "./examples/dataFetching";
import { ExampleLink } from "./ExampleLink";
import { VisibilityExample } from "./examples/visibility";
import { observe } from "../src/Signal";
import { RoutingExample } from "./examples/routing";
import { XStateExample } from "./examples/xstate";
import { useRouter } from "./useRouter";

export function App() {
  using _ = observe();

  const router = useRouter();

  let content;

  if (!router.route) {
    return <Box>Route not found</Box>;
  }

  switch (router.route.name) {
    case "datafetching": {
      content = <DataFetchingExample />;
      break;
    }
    case "visibility": {
      content = <VisibilityExample />;
      break;
    }
    case "routing": {
      content = <RoutingExample />;
      break;
    }
    case "xstate": {
      content = <XStateExample />;
      break;
    }
  }

  return (
    <Flex gap="4">
      <Flex p="4" gap="2" direction="column">
        <Heading size="4">Learn</Heading>
        <Heading size="4">Examples</Heading>
        <ExampleLink name="datafetching" params={{}}>
          Data Fetching
        </ExampleLink>
        <ExampleLink name="visibility" params={{}}>
          Visibility
        </ExampleLink>
        <ExampleLink name="routing" params={{ page: "page-a" }}>
          Routing
        </ExampleLink>
        <ExampleLink name="xstate" params={{}}>
          XState
        </ExampleLink>
      </Flex>
      {content}
    </Flex>
  );
}
