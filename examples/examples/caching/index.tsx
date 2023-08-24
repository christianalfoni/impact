import { Box, Button, Flex, Tabs, Text } from "@radix-ui/themes";
import { useApi } from "../../services/Api";
import { useState } from "react";
import { observe } from "impact-app";
import { Example1 } from "./Example1";
import { Example2 } from "./Example2";
import { useRouter } from "../../services/Router";

const examples = [
  Example1,
  Example2
]

export function Caching({ example, onClickExample }: { example: string, onClickExample: (example: string) => void }) {
  using _ = observe()

  const api = useApi();

  return (
    <Flex direction="column" gap="2">
      <Text align="center" size="8">
        Caching Examples in Impact
      </Text>
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
          {examples.map((_, index) => <Tabs.Trigger key={index} value={String(index + 1)}>Example {index + 1}</Tabs.Trigger>)}
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
