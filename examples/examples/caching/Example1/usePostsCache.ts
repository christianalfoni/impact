import { SuspensePromise, createHook } from "impact-app";

import { commonHooks } from "../../../common-hooks";
import { PostDTO } from "../../../common-hooks/useApi";

function PostsCache() {
  const api = commonHooks.useApi();
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
