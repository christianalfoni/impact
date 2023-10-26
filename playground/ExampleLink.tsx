import { observer } from "impact-app";
import { Link } from "@radix-ui/themes";
import { Routes, useGlobalContext } from "./useGlobalContext";

export function ExampleLink({
  name,
  params,
  children,
}: Routes & {
  children: string;
}) {
  using _ = observer();

  const { router } = useGlobalContext();

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
