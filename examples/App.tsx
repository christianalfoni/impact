import { Flex } from "@radix-ui/themes";
import { ExampleLink, useRouter } from "./services/Router";
import { observe } from "../src/Signal";

export function App() {
  using _ = observe()
  
  const router = useRouter();

  return (
    <Flex gap="4">
      <Flex p="4" direction="column">
      <ExampleLink number={1}>
        Caching
      </ExampleLink>
      <ExampleLink number={2}>
        Visibility
      </ExampleLink>
      </Flex>
      <Flex p="4" grow="1">
        Hm: {router.route.params.number}
      </Flex>
    </Flex>
  );
}
