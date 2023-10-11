import { Flex, Heading, Text } from "@radix-ui/themes";
import { ExampleSandpack } from "../ExampleSandpack";

export function DataFetchingExample() {
  return (
    <Flex direction="column" gap="4" grow="1">
      <Heading>Data Fetching</Heading>
      <Flex direction="column" gap="4" p="4">
        <Heading size="4">Simple cache</Heading>
        <Text>
          In this example we simply cache the post we are getting. Notice that
          you can still flip between the posts while they are loading and they
          will be cached.
        </Text>
        <ExampleSandpack
          example={`import { Box, Button, Flex, Text } from "@radix-ui/themes";
import { Suspense, useState } from "react";
import { generateId } from './api'
import { useApi } from "./useApi";

function Post({ id }: { id: string }) {
  const api = useApi();
  const post = api.posts.suspend(id);

  return (
    <Text size="4">
      {post.id} - {post.title}
    </Text>
  );
}

const firstPostId = generateId();
const secondPostId = generateId();

function Posts() {
  const [postId, setPostId] = useState(firstPostId);

  return (
    <Flex direction="column" gap="2">
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
          <Post key={postId} id={postId} />
        </Suspense>
      </Box>
    </Flex>
  );
}

export default Posts`}
          files={{
            "/useApi.js": `import { useStore, queries } from "impact-app";
import { getPost } from './api'

function Api() {
  return {
    posts: queries((id) => getPost(id))
  }
}

export const useApi = () => useStore(Api);`,
          }}
        />

        <Heading size="4">Subscribe to updates</Heading>
        <Text>
          In this example we subscribe to updates on posts that we have fetched.
          Notice that you can move between the posts and they update in the
          background.
        </Text>
        <ExampleSandpack
          example={`import { Box, Button, Flex, Text } from "@radix-ui/themes";
import { Suspense, useEffect, useState } from "react";
import { generateId } from './api'
import { useApi } from "./useApi";

function Post({ id }: { id: string }) {
  const api = useApi();
  const post = api.posts.suspend(id);

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
          <Post key={postId} id={postId} />
        </Suspense>
      </Box>
    </Flex>
  );
}

export default Posts`}
          files={{
            "/useApi.js": `import { useStore, queries, useCleanup } from "impact-app";
import { onPostUpdate, getPost } from './api'

function Api() {
  const posts = queries((id) => getPost(id))

  useCleanup(onPostUpdate(handlePostUpdate))

  function handlePostUpdate(updatedPost) {
    posts.setValue(updatedPost.id, updatedPost);
  }

  return {
    posts
  }
}

export const useApi = () => useStore(Api);`,
          }}
        />

        <Heading size="4">Optimistic fetch</Heading>
        <Text>
          In this example the server notifies when a new post is added. The
          cache immediately fetches the post. When you open a post quickly it is
          still loading or if you wait a bit it is already loaded.
        </Text>
        <ExampleSandpack
          example={`import { Box, Button, Flex, Text } from "@radix-ui/themes";
import { observe } from 'impact-app'
import { Suspense, useState } from "react";
import { addPost } from './api'
import { useApi } from "./useApi";

function Post({ id }: { id: string }) {
  const api = useApi();
  const post = api.posts.suspend(id);

  return (
    <Text size="4">
      {post.id} - {post.title}
    </Text>
  );
}

export function Posts() {
  const api = useApi();
  const [postId, setPostId] = useState(null);

  return (
    <Flex direction="column" gap="2">
      <Button
        variant="outline"
        onClick={() => {
          addPost()
        }}
      >
        Add post
      </Button>
      <Flex gap="2">
        {api.newPosts.map((postId) => (
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
            <Post key={postId} id={postId} />
          </Suspense>
        </Box>
      ) : null}
    </Flex>
  );
}

export default observe(Posts)`}
          files={{
            "/useApi.js": `import { useStore, queries, useCleanup, signal } from "impact-app";
import { onNewPost, getPost } from './api'

function Api() {
  const newPosts = signal([])
  const posts = queries((id) => getPost(id))

  useCleanup(onNewPost(handleNewPost))

  function handleNewPost(id) {
    posts.refetch(id);
    newPosts.value = (current) => [...current, id]
  }

  return {
    get newPosts() {
      return newPosts.value
    },
    posts
  }
}

export const useApi = () => useStore(Api);`,
          }}
        />
      </Flex>
    </Flex>
  );
}
