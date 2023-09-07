import { Box, Button, Flex, Text } from "@radix-ui/themes";
import { Suspense, useEffect, useState } from "react";
import { usePostsCache } from "./usePostsCache";
import { observe } from "impact-app";

function Post({ id }: { id: string }) {
  using _ = observe();

  const postsCache = usePostsCache();
  const post = postsCache.getPost(id).use();

  return (
    <Text size="4">
      {id} - {post.title}
    </Text>
  );
}

export function PostsCache() {
  using _ = observe();

  const postsCache = usePostsCache();
  const [postId, setPostId] = useState<string | null>(null);
  const [availablePosts, setAvailablePosts] = useState<string[]>([]);

  useEffect(
    () =>
      postsCache.onNewPost((id) => {
        setAvailablePosts((current) => [...current, id]);
      }),
    [],
  );

  return (
    <Flex direction="column" gap="2">
      <Text>
        In this example the server notifies when a new post is added. The cache
        immediately fetches the post. When you open a post quickly it is still
        loading or if you wait a bit it is already loaded.
      </Text>
      <Flex gap="2">
        {availablePosts.map((postId) => (
          <Button
            key={postId}
            variant="outline"
            onClick={() => {
              setPostId(postId);
            }}
          >
            Load {postId}
          </Button>
        ))}
      </Flex>
      {postId ? (
        <Box m="4">
          <Suspense fallback={<Text size="2">Loading post {postId}...</Text>}>
            <Post id={postId} />
          </Suspense>
        </Box>
      ) : null}
    </Flex>
  );
}
