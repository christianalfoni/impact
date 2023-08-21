import { Flex, Link } from "@radix-ui/themes";

export function App() {
  return (
    <Flex gap="4">
      <Flex p="4">
        <Link>Example 1</Link>
      </Flex>
      <Flex p="4" grow="1">
        there
      </Flex>
    </Flex>
  );
}
