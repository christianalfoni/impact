import { Sandpack } from "@codesandbox/sandpack-react";

export function ExampleSandpack({
  example,
  files,
  dependencies,
}: {
  example: string;
  files: Record<string, string>;
  dependencies?: string[];
}) {
  return (
    <Sandpack
      template="react"
      theme="light"
      options={{
        showNavigator: true,
        showLineNumbers: true,
        showTabs: true,
        closableTabs: true,
      }}
      customSetup={{
        dependencies: {
          "impact-app": "0.29.0",
          "@radix-ui/themes": "latest",
          ...(dependencies?.reduce<Record<string, string>>(
            (aggr, dependency) => {
              aggr[dependency] = "latest";

              return aggr;
            },
            {},
          ) ?? {}),
        },
      }}
      files={{
        ...files,
        "/node_modules/stacktrace-gps/stacktrace-gps.js": {
          hidden: true,
          code: `export default class Fake { pinpoint() { return Promise.resolve({ setFunctionName() {} })} }`,
        },
        "/App.js": {
          hidden: true,
          active: false,
          code: `import "@radix-ui/themes/styles.css";
import { Theme } from '@radix-ui/themes'
import Example from './Example'

export default function App() {
    return (
        <Theme
            accentColor="grass"
            grayColor="gray"
            panelBackground="solid"
            scaling="100%"
            radius="full"
            style={{ height: "100vh" }}
        >
            <Example />
        </Theme>
    )
}
`,
        },
        "/api.js": {
          hidden: true,
          code: `import { emitter } from "impact-app";

export function generateId() {
  return (
    Math.round(Math.random() * 1000) + "-" + Math.round(Math.random() * 1000)
  );
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const UPDATE_POST_INTERVAL = 1500;

let serverPosts = {};
const postUpdateEmitter = emitter();
const newPostEmitter = emitter();
const updateExistingPostsInterval = setInterval(
  updateExistingPosts,
  UPDATE_POST_INTERVAL,
);

function updateExistingPosts() {
  for (const postId in serverPosts) {
    const post = serverPosts[postId];
    const newPost = {
      ...post,
      updateCount: post.updateCount + 1,
    };
    serverPosts[postId] = newPost;
    postUpdateEmitter.emit(newPost);
  }
}

export const onPostUpdate = postUpdateEmitter.on

export const onNewPost = newPostEmitter.on

export const getPost = async (id) => {
  await sleep(1000);

  let post = serverPosts[id];

  if (!post) {
    serverPosts[id] = post = {
      id,
      title: "New post",
      updateCount: 0,
    };
  }

  return post;
}

export const getProject = async (id) => {
  await sleep(1000);

  serverPosts[id] = serverPosts[id] || {
    id,
    title: "My awesome project",
    updatedAt: Date.now()
  }

  return serverPosts[id]
}

export const addPost = () => {
  const id = generateId();

  serverPosts[id] = {
    id,
    title: "New post",
    updateCount: 0,
  };

  newPostEmitter.emit(id);
}

export const changeProjectTitle = async (id, newTitle) => {
  await sleep(1000);

  serverPosts[id] = {
    ...serverPosts[id],
    title: newTitle,
  };

  postUpdateEmitter.emit(serverPosts[id]);

  return serverPosts[id]
}

export const clear = () => {
  serverPosts = {};
  version.value++;
}

`,
        },
        "/Example.js": {
          active: true,
          code: example,
        },
      }}
    />
  );
}
