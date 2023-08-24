import { ServiceProvider } from "impact-app";
import { PostsCacheService } from "./PostsCacheService";
import { PostsCache } from "./PostsCache";

export function Example1() {
  return (
    <ServiceProvider services={[PostsCacheService]}>
      <PostsCache />
    </ServiceProvider>
  );
}
