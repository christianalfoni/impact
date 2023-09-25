import { CheckCircledIcon } from "@radix-ui/react-icons";
import { Callout } from "@radix-ui/themes";

export function LearnCallout({ children }: { children: string }) {
  return (
    <Callout.Root color="green">
      <Callout.Icon>
        <CheckCircledIcon />
      </Callout.Icon>
      <Callout.Text>{children}</Callout.Text>
    </Callout.Root>
  );
}
