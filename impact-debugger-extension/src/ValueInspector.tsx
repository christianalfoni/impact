import { useRef, useState } from "react";
import Inspector from "./Inspector";

type Props = {
  value: any;
  delimiter: string;
  expandedPaths?: string[];
  isState?: boolean;
};

const ValueInspector = (props: Props) => {
  const [expandedPaths, setExpandedPaths] = useState<string[]>(
    props.expandedPaths ?? [],
  );
  const valueReferenceRef = useRef({
    key: 0,
    value: props.value,
  });

  if (valueReferenceRef.current.value !== props.value) {
    valueReferenceRef.current = {
      key: valueReferenceRef.current.key + 1,
      value: props.value,
    };
  }

  function onToggleExpand(path: string[]) {
    const pathString = path.join(props.delimiter);

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
      key={valueReferenceRef.current.key}
      delimiter={props.delimiter}
      value={valueReferenceRef.current.value}
      expandedPaths={expandedPaths}
      onToggleExpand={onToggleExpand}
      isState={props.isState}
    />
  );
};

export default ValueInspector;
