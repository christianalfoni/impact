import { PostsCache } from "./PostsCache";
import { createStoresProvider } from "impact-app";
import { usePostsCache } from "./usePostsCache";

const StoresProvider = createStoresProvider({ usePostsCache });

export function Example1() {
  return (
    <StoresProvider>
      <PostsCache />
    </StoresProvider>
  );
}
