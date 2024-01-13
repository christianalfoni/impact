import { h } from "preact";
import { useState } from "preact/hooks";
import Inspector from "./Inspector";
const ValueInspector = ({ value, small, delimiter }) => {
    const [expandedPaths, setExpandedPaths] = useState([]);
    function onToggleExpand(path) {
        const pathString = path.join(delimiter);
        if (expandedPaths.includes(pathString)) {
            setExpandedPaths(expandedPaths.filter((currentPath) => currentPath !== pathString));
        }
        else {
            setExpandedPaths(expandedPaths.concat(pathString));
        }
    }
    return (h(Inspector, { delimiter: delimiter, value: value, expandedPaths: expandedPaths, onToggleExpand: onToggleExpand, small: small }));
};
export default ValueInspector;
//# sourceMappingURL=ValueInspector.js.map