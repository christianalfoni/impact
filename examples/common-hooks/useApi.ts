import { createHook, useDispose } from "../../src/ReactiveHooks";
import { useSignal } from "../../src/Signal";
import { emitter } from "../../src/emitter";

export function generateId() {
  return (
    Math.round(Math.random() * 1000) + "-" + Math.round(Math.random() * 1000)
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type PostDTO = {
  id: string;
  title: string;
  updateCount: number;
};

const UPDATE_POST_INTERVAL = 1500;

function Api() {
  let serverPosts: Record<string, PostDTO> = {};
  const version = useSignal(0);
  const postUpdateEmitter = emitter<PostDTO>();
  const newPostEmitter = emitter<string>();
  const updateExistingPostsInterval = setInterval(
    updateExistingPosts,
    UPDATE_POST_INTERVAL
  );

  useDispose(() => clearInterval(updateExistingPostsInterval));

  function updateExistingPosts() {
    for (const postId in serverPosts) {
      const post = serverPosts[postId];
      const newPost: PostDTO = {
        ...post,
        updateCount: post.updateCount + 1,
      };
      serverPosts[postId] = newPost;
      postUpdateEmitter.emit(newPost);
    }
  }

  return {
    onPostUpdate: postUpdateEmitter.on,
    onNewPost: newPostEmitter.on,

    get version() {
      return version.value;
    },

    async getPost(id: string) {
      await sleep(2000);

      let post = serverPosts[id];

      if (!post) {
        serverPosts[id] = post = {
          id,
          title: "New post",
          updateCount: 0,
        };
      }

      return post;
    },
    addPost() {
      const id = generateId();

      serverPosts[id] = {
        id,
        title: "New post",
        updateCount: 0,
      };

      newPostEmitter.emit(id);
    },
    clear() {
      serverPosts = {};
      version.value++;
    },
  };
}

export const useApi = createHook(Api);
