import { observe } from "../src/Signal";
import { Routes, useRouter } from "./global-hooks/useRouter";
import { Link } from "@radix-ui/themes";

export function ExampleLink({
  name,
  params,
  children,
}: Routes & {
  children: string;
}) {
  using _ = observe()
  
  const router = useRouter();

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
