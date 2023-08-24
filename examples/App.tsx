import { Flex } from "@radix-ui/themes";
import { ExampleLink, useRouter } from "./services/Router";
import { observe } from "../src/Signal";
import { Caching } from "./examples/caching";

export function App() {
  using _ = observe()
  
  const router = useRouter();

  let content

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
