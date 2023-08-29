import { SuspensePromise, createHook, useDispose } from "impact-app";
import { PostDTO } from "../../../common-hooks/useApi";
import { commonHooks } from "../../../common-hooks";

function PostsCache() {
  const api = commonHooks.useApi();
  const cache: Record<string, SuspensePromise<PostDTO>> = {};
  const disposeNewPostListener = api.onNewPost(onNewPost);

  useDispose(disposeNewPostListener);

  function onNewPost(id: string) {
    cache[id] = SuspensePromise.from(api.getPost(id));
  }

  return {
    onNewPost: api.onNewPost,
    getPost(id: string) {
      let post = cache[id];

      if (!post) {
        cache[id] = post = SuspensePromise.from(api.getPost(id));
      }

      return post;
    },
  };
}

export const usePostsCache = createHook(PostsCache);
