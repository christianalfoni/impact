import { PostsCache } from "./PostsCache";
import { createHooksProvider } from "impact-app";
import { usePostsCache } from "./usePostsCache";

const HooksProvider = createHooksProvider({ usePostsCache });

export function Example1() {
  return (
    <HooksProvider>
      <PostsCache />
    </HooksProvider>
  );
}
