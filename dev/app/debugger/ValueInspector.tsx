import { useState } from "react";
import Inspector from "./Inspector";

type Props = {
  value: any;
  delimiter: string;
};

const ValueInspector = ({ value, delimiter }: Props) => {
  const [expandedPaths, setExpandedPaths] = useState<string[]>([""]);

  function onToggleExpand(path: string[]) {
    const pathString = path.join(delimiter);

    if (expandedPaths.includes(pathString)) {
      setExpandedPaths(
        expandedPaths.filter((currentPath) => currentPath !== pathString),
      );
    } else {
      setExpandedPaths(expandedPaths.concat(pathString));
    }
  }

  return (
    <Inspector
      delimiter={delimiter}
      value={value}
      expandedPaths={expandedPaths}
      onToggleExpand={onToggleExpand}
    />
  );
};

export default ValueInspector;
