import { createStoresProvider } from "impact-app";
import { usePostsCache } from "./usePostsCache";
import { PostsCache } from "./PostsCache";

const StoresProvider = createStoresProvider({ usePostsCache });

export function Example3() {
  return (
    <StoresProvider>
      <PostsCache />
    </StoresProvider>
  );
}
