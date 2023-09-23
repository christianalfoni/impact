import { Flex, Heading, Text } from "@radix-ui/themes";
import { ExampleSandpack } from "../ExampleSandpack";

export function RoutingExample() {
  return (
    <Flex direction="column" gap="4" grow="1">
      <Heading>Routing</Heading>
      <Text>In this example we create a hook for a router.</Text>
      <ExampleSandpack
        dependencies={["typed-client-router"]}
        example={`import { observe } from "impact-app";
import { useRouter } from "./useRouter";
import { Box, Button, Flex } from "@radix-ui/themes";

function Pages() {
  const router = useRouter();

  let content;

  if (router.route?.name === "pageA") {
    content = <Box>Page A</Box>;
  }

  if (router.route?.name === "pageB") {
    content = <Box>Page B</Box>;
  }

  if (router.route?.name === "pageC") {
    content = <Box>Page C</Box>;
  }

  return (
    <Box>
      <Flex p="2" gap="2">
        <Button
          onClick={() => {
            router.openPageA();
          }}
        >
          Page A
        </Button>
        <Button
          onClick={() => {
            router.openPageB("123");
          }}
        >
          Page B
        </Button>
        <Button
          onClick={() => {
            router.openPageC({ showSomething: true });
          }}
        >
          Page C
        </Button>
      </Flex>
      {content} - {\`\${window.location.pathname}\${window.location.search}\`}
    </Box>
  );
}

export default observe(Pages)`}
        files={{
          "/useRouter.js": `import { createHook, signal, useCleanup } from "impact-app";
import { createRouter } from "typed-client-router";

const routes = {
  pageA: "/page-a",
  pageB: "/page-b/:id",
  pageC: "/page-c",
};

function Router() {
  const router = createRouter(routes);
  const route = signal(router.current);

  useCleanup(router.listen(handleRouteChange));

  router.replace('pageA')

  function handleRouteChange(newRoute) {
    route.value = newRoute;
  }

  return {
    get route() {
      return route.value;
    },
    openPageA() {
      router.push("pageA", {});
    },
    openPageB(id: string) {
      router.push("pageB", { id });
    },
    openPageC({ showSomething }) {
      router.push("pageC", {}, { showSomething: String(showSomething) });
    },
  };
}

export const useRouter = createHook(Router);`,
        }}
      />
    </Flex>
  );
}
