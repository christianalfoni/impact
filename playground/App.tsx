import { Box, Flex, Heading } from "@radix-ui/themes";

import { DataFetchingExample } from "./examples/dataFetching";
import { ExampleLink } from "./ExampleLink";
import { VisibilityExample } from "./examples/visibility";
import { observer } from "../src/Signal";
import { RoutingExample } from "./examples/routing";
import { XStateExample } from "./examples/xstate";
import { LearnStores } from "./learn/stores";
import { LearnSignals } from "./learn/signals";
import { LearnQueries } from "./learn/queries";
import { LearnMutations } from "./learn/mutations";
import { useRouter } from "./stores/RouterStore";

export function App() {
  using _ = observer();

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
    case "stores": {
      content = <LearnStores />;
      break;
    }
    case "signals": {
      content = <LearnSignals />;
      break;
    }
    case "queries": {
      content = <LearnQueries />;
      break;
    }
    case "mutations": {
      content = <LearnMutations />;
      break;
    }
  }

  return (
    <Flex gap="4">
      <Flex p="4" gap="2" direction="column" style={{ minWidth: "200px" }}>
        <Heading size="4">Learn</Heading>
        <ExampleLink name="stores" params={{}}>
          Stores
        </ExampleLink>
        <ExampleLink name="signals" params={{}}>
          Signals
        </ExampleLink>
        <ExampleLink name="queries" params={{}}>
          Queries
        </ExampleLink>
        <ExampleLink name="mutations" params={{}}>
          Mutations
        </ExampleLink>
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
