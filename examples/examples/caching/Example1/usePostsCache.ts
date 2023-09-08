import { SuspensePromise, createStore } from "impact-app";

import { globalStores } from "../../../global-stores";
import { PostDTO } from "../../../global-stores/useApi";

function PostsCache() {
  const api = globalStores.useApi();
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

export const usePostsCache = createStore(PostsCache);
