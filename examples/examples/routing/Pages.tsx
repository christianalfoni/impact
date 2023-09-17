import { observe } from "impact-app";
import { useRouter } from "./useRouter";
import { Box, Button, Flex } from "@radix-ui/themes";

export function Pages() {
  using _ = observe();
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
      {content} - {`${window.location.pathname}${window.location.search}`}
    </Box>
  );
}
