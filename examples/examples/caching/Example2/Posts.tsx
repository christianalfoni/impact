import { Box, Button, Flex, Text } from "@radix-ui/themes";
import { Suspense, useEffect, useState } from "react";

import { generateId, useApi } from "../../../global-hooks/useApi";

function Post({ id }: { id: string }) {
  const api = useApi();
  const post = api.posts.suspend(id);

  useEffect(
    () =>
      api.onPostUpdate((updatedPost) => {
        if (updatedPost.id === id) {
          api.posts.fulfill(id, updatedPost);
        }
      }),
    [id],
  );

  return (
    <Text size="4">
      {post.id} - {post.title} - {post.updateCount}
    </Text>
  );
}

const firstPostId = generateId();
const secondPostId = generateId();

export function Posts() {
  const [postId, setPostId] = useState(firstPostId);

  return (
    <Flex direction="column" gap="2">
      <Text>
        In this example we subscribe to updates on posts when the post is shown.
        When you navigate to a different post the cache goes stale, but updates
        again when the post loads
      </Text>
      <Flex gap="2">
        <Button
          variant="outline"
          onClick={() => {
            setPostId(firstPostId);
          }}
        >
          Load first post
        </Button>
        <Button
          onClick={() => {
            setPostId(secondPostId);
          }}
          variant="outline"
        >
          Load second post
        </Button>
      </Flex>
      <Box m="4">
        <Suspense fallback={<Text size="2">Loading post {postId}...</Text>}>
          <Post id={postId} />
        </Suspense>
      </Box>
    </Flex>
  );
}
