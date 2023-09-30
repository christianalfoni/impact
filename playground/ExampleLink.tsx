import { useStore } from "impact-app";
import { observe } from "../src/Signal";
import { Link } from "@radix-ui/themes";
import { RouterStore, Routes } from "./stores/RouterStore";

export function ExampleLink({
  name,
  params,
  children,
}: Routes & {
  children: string;
}) {
  using _ = observe();

  const router = useStore(RouterStore);

  return (
    <Link
      href={router.getUrl({ name, params })}
      onClick={(event) => {
        event.preventDefault();
        router.open({ name, params });
      }}
    >
      {children}
    </Link>
  );
}
