import { Box, Button, Flex, Tabs, Text } from "@radix-ui/themes";
import { Example1 } from "./Example1";
import { globalHooks } from "../../global-hooks";
import { Example2 } from "./Example2";
 import { Example3 } from "./Example3";

const examples = [
  Example1,
  Example2,
  Example3
]

export function Caching({ example, onClickExample }: { example: string, onClickExample: (example: string) => void }) {
  using api = globalHooks.useApi();

  return (
    <Flex direction="column" gap="2">
      <Box p="4">
        <Text align="center" size="8">
          Caching Examples in Impact
        </Text>
      </Box>
      <Flex align="center" gap="2">
        <Text weight="bold">API:</Text>
        <Button
          onClick={() => {
            api.addPost();
          }}
        >
          Add post
        </Button>
        <Button
          onClick={() => {
            api.clear();
          }}
        >
          Clear posts
        </Button>
      </Flex>
      <Tabs.Root key={api.version} value={example} onValueChange={(value) => {
        onClickExample(value)
      }}>
        <Tabs.List size="1">
          {examples.map((_, index) => <Tabs.Trigger key={index} value={String(index + 1)}>
            <Text size="4">Example {index + 1}</Text>
          </Tabs.Trigger>)}
        </Tabs.List>

        <Box px="2" pt="2" pb="2">
          {examples.map((Example, index) => (
            <Tabs.Content key={index} value={String(index + 1)}>
              <Example />
            </Tabs.Content>
          ))}
        </Box>
      </Tabs.Root>
    </Flex>
  );
}
