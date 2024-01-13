import { h } from "preact";
import { useState } from "preact/hooks";
import { memo } from "preact/compat";
import * as styles from "./styles";
import { isArray, isObject, isValidJson } from "./utils";
function renderValue({ path, value, delimiter, renderPaths, expandedPaths, onClickPath, onToggleExpand, selectedStatePath, onSubmitState, }) {
    const wrapper = renderPaths && renderPaths[path];
    let node;
    if (isObject(value)) {
        node = (h(Nested, { key: path, startBracket: "{", endBracket: "}", path: path, delimiter: delimiter, expandedPaths: expandedPaths, hasWrapper: Boolean(wrapper), onClickPath: onClickPath, renderPaths: renderPaths, onToggleExpand: onToggleExpand, isArray: false, value: value, selectedStatePath: selectedStatePath, onSubmitState: onSubmitState }));
    }
    else if (isArray(value)) {
        node = (h(Nested, { key: path, startBracket: "[", endBracket: "]", delimiter: delimiter, renderPaths: renderPaths, path: path, expandedPaths: expandedPaths, hasWrapper: Boolean(wrapper), onClickPath: onClickPath, onToggleExpand: onToggleExpand, isArray: true, value: value, selectedStatePath: selectedStatePath, onSubmitState: onSubmitState }));
    }
    else {
        node = (h(ValueComponent, { key: path, path: path, delimiter: delimiter, value: value, onClickPath: onClickPath, selectedStatePath: selectedStatePath, hasWrapper: Boolean(wrapper), onSubmitState: onSubmitState }));
    }
    return wrapper ? wrapper(node) : node;
}
const PathKey = ({ path, onClickPath, onToggleExpand, disabled, delimiter, }) => {
    return path.length ? (h("span", { className: styles.key, onClick: disabled
            ? undefined
            : (event) => {
                event.stopPropagation();
                if (onClickPath && (event.metaKey || event.ctrlKey)) {
                    onClickPath(path.split(delimiter));
                }
                else if (onToggleExpand) {
                    onToggleExpand(path.split(delimiter));
                }
            } },
        path.split(delimiter).pop(),
        ":")) : null;
};
const EditValue = ({ value, onSubmit }) => {
    const [state, setState] = useState(() => JSON.stringify(value, null, 2));
    const isValid = isValidJson(state);
    return (h("span", { className: styles.editValueWrapper, onClick: (event) => event.stopPropagation() },
        h("div", { className: styles.editValuePopup },
            h("textarea", { autoFocus: true, value: state, onChange: (event) => setState(event.currentTarget.value), onKeyDown: (event) => {
                    if ((event.metaKey || event.ctrlKey) && event.keyCode === 13) {
                        onSubmit(state);
                    }
                }, className: styles.newState, style: {
                    borderColor: isValid ? undefined : styles.colors.red,
                } }),
            h("span", { className: styles.ok }, "CMD/CTRL + ENTER to save"))));
};
const Nested = memo(({ expandedPaths, path, onToggleExpand, onClickPath, startBracket, renderPaths, hasWrapper, endBracket, isArray, selectedStatePath, value, delimiter, onSubmitState, }) => {
    const shouldCollapse = !expandedPaths.includes(path);
    const isClass = value.__CLASS__;
    if (selectedStatePath && path === selectedStatePath) {
        return (h("div", { className: styles.inlineNested, onClick: (event) => {
                event.stopPropagation();
                onToggleExpand(path.split(delimiter));
            } },
            path.length ? (h("span", { className: styles.key },
                path.split(delimiter).pop(),
                ":")) : null,
            h(EditValue, { value: isClass ? value.value : value, onSubmit: onSubmitState })));
    }
    if (shouldCollapse) {
        const keys = isClass ? Object.keys(value.value) : Object.keys(value);
        return (h("div", { className: styles.inlineNested, onClick: (event) => {
                event.stopPropagation();
                onToggleExpand(path.split(delimiter));
            } },
            h(PathKey, { path: path, delimiter: delimiter, onClickPath: onClickPath, onToggleExpand: onToggleExpand, disabled: !onSubmitState || hasWrapper }),
            startBracket,
            h("span", { className: styles.keyCount }, isArray ? (keys.length + " items") : (h("span", { className: styles.inlineNested },
                isClass ? (h("span", { className: styles.inlineClass }, value.name)) : null,
                " ",
                keys.sort().slice(0, 3).join(", ") + "..."))),
            endBracket));
    }
    return (h("div", null,
        h("div", { className: styles.bracket(true), onClick: (event) => {
                event.stopPropagation();
                onToggleExpand(path.split(delimiter));
            } },
            h(PathKey, { path: path, delimiter: delimiter, onClickPath: onClickPath, onToggleExpand: onToggleExpand, disabled: !onSubmitState || hasWrapper }),
            startBracket),
        h("div", { className: styles.nestedChildren }, Array.isArray(value)
            ? value.map((_, index) => renderValue({
                path: path.concat((path ? delimiter : "") + String(index)),
                delimiter,
                value: value[index],
                renderPaths,
                expandedPaths,
                onClickPath,
                onSubmitState,
                onToggleExpand,
                selectedStatePath,
            }))
            : isClass
                ? [
                    h("span", { className: styles.otherValue, key: path.concat((path ? delimiter : "") + "__CLASS__") }, value.name),
                    ...Object.keys(value.value)
                        .sort()
                        .map((key) => {
                        return renderValue({
                            path: path.concat((path ? delimiter : "") + key),
                            value: value.value[key],
                            delimiter,
                            renderPaths,
                            expandedPaths,
                            onClickPath,
                            onSubmitState,
                            onToggleExpand,
                            selectedStatePath,
                        });
                    }),
                ]
                : Object.keys(value)
                    .sort()
                    .map((key) => {
                    return renderValue({
                        path: path.concat((path ? delimiter : "") + key),
                        value: value[key],
                        delimiter,
                        renderPaths,
                        expandedPaths,
                        onClickPath,
                        onSubmitState,
                        onToggleExpand,
                        selectedStatePath,
                    });
                })),
        h("div", { className: styles.bracket(false) }, endBracket)));
});
const ValueComponent = memo(({ value, path, onClickPath, selectedStatePath, onSubmitState, hasWrapper, delimiter, }) => {
    const [isHoveringString, setHoveringString] = useState(false);
    if (selectedStatePath && path === selectedStatePath) {
        return (h("div", { className: styles.genericValue },
            path.length ? (h("span", { className: styles.key },
                path.split(delimiter).pop(),
                ":")) : null,
            h(EditValue, { value: value, onSubmit: onSubmitState })));
    }
    if (typeof value === "string" &&
        value[0] === "[" &&
        value[value.length - 1] === "]") {
        return (h("div", { className: styles.otherValue },
            h(PathKey, { path: path, delimiter: delimiter, onClickPath: onClickPath, disabled: !onSubmitState || hasWrapper }),
            value.substr(1, value.length - 2)));
    }
    if (typeof value === "string") {
        return (h("div", { className: styles.stringValue },
            h(PathKey, { path: path, delimiter: delimiter, onClickPath: onClickPath, disabled: !onSubmitState || hasWrapper }),
            h("div", { onMouseOver: () => setHoveringString(true), onMouseOut: () => setHoveringString(false) },
                '"',
                value.length > 50 && !isHoveringString
                    ? value.substr(0, 50) + "..."
                    : value,
                '"')));
    }
    return (h("div", { className: styles.genericValue },
        h(PathKey, { path: path, delimiter: delimiter, onClickPath: onClickPath, disabled: !onSubmitState || hasWrapper }),
        String(value)));
});
const Inspector = ({ value, expandedPaths, small, onToggleExpand, delimiter, onClickPath = () => { }, renderPaths, selectedStatePath = "", onSubmitState, }) => {
    return (h("div", { className: small ? styles.smallWrapper : styles.inspectorWrapper }, renderValue({
        path: "",
        delimiter,
        value,
        renderPaths,
        expandedPaths,
        onClickPath,
        onToggleExpand,
        selectedStatePath,
        onSubmitState,
    })));
};
export default Inspector;
//# sourceMappingURL=Inspector.js.map