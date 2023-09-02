import { SuspensePromise, createHook } from "impact-app";

import { globalHooks } from "../../../global-hooks";
import { PostDTO } from "../../../global-hooks/useApi";

function PostsCache() {
  const api = globalHooks.useApi();
  const cache: Record<string, SuspensePromise<PostDTO>> = {};

  return {
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
