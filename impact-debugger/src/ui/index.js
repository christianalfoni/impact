import { render, h, Fragment } from "preact";
import ValueInspector from "./ValueInspector";
import * as styles from "./styles";
import { useState, useSyncExternalStore } from "preact/compat";
import { useEffect } from "react";
const root = document.createElement("div");
root.style.position = "fixed";
root.style.zIndex = "99999999999999999999";
root.style.top = "0px";
root.style.right = "0px";
let currentDebugData = [];
let currentSubscriber;
export function addDebugData(data) {
    currentDebugData = [data, ...currentDebugData];
    currentSubscriber === null || currentSubscriber === void 0 ? void 0 : currentSubscriber(currentDebugData);
}
function useWorkspacePath() {
    const [workspacePath, setWorkspacePath] = useState(localStorage.getItem("impact.debugger.workspacePath") || "");
    useEffect(() => {
        if (workspacePath) {
            localStorage.setItem("impact.debugger.workspacePath", workspacePath);
        }
    }, [workspacePath]);
    return [workspacePath, setWorkspacePath];
}
function CodeReference({ name, path, workspacePath, type, }) {
    return (h("span", { className: "impact-debugger-tooltip" },
        h("span", { className: styles.tooltip }, path),
        h("a", { href: "vscode://file/" +
                (workspacePath.startsWith("/")
                    ? workspacePath.substring(1)
                    : workspacePath) +
                path, className: styles.itemLink, style: type
                ? {
                    color: type === "component"
                        ? styles.colors.blue
                        : type === "effect"
                            ? styles.colors.purple
                            : styles.colors.green,
                }
                : undefined }, name)));
}
function Item({ data, workspacePath, }) {
    let content;
    if (data.type === "signal") {
        const observers = data.observers.slice();
        const lastObserver = observers.pop();
        content = (h(Fragment, null,
            h("div", null,
                h("span", { className: styles.circle }, data.observers.length)),
            h("div", { className: styles.itemContent },
                h("div", { className: styles.itemTextContent },
                    "Signal changed in",
                    " ",
                    h(CodeReference, { workspacePath: workspacePath, name: data.target.name, path: data.target.path }),
                    " ",
                    "with the value",
                    " ",
                    h("span", { className: styles.itemValue },
                        h(ValueInspector, { delimiter: ".", value: data.value })),
                    ". Called from",
                    " ",
                    h(CodeReference, { workspacePath: workspacePath, name: data.source.name, path: data.source.path }),
                    ". Observed by",
                    " ",
                    observers.length ? (h(Fragment, null,
                        observers.map((observer, index) => (h(Fragment, null,
                            h(CodeReference, Object.assign({ key: index, workspacePath: workspacePath }, observer)),
                            index === observers.length - 1 ? " " : ", "))),
                        " ",
                        "and",
                        " ")) : null,
                    lastObserver ? (h(CodeReference, Object.assign({ workspacePath: workspacePath }, lastObserver))) : null),
                h("div", null))));
    }
    return (h("li", null,
        h("div", { className: styles.itemWrapper },
            h("span", { className: styles.line }),
            h("div", { className: styles.itemContentWrapper }, content))));
}
function App() {
    const debugData = useSyncExternalStore((update) => {
        currentSubscriber = update;
        return () => {
            currentSubscriber = undefined;
        };
    }, () => currentDebugData);
    const [workspacePath, setWorkspacePath] = useWorkspacePath();
    return (h("div", { className: styles.wrapper },
        h("div", { className: styles.innerWrapper },
            h("div", { className: styles.workspaceWrapper },
                h("div", { className: styles.workspaceInnerWrapper },
                    h("div", null,
                        h("label", { className: styles.workspaceLabel }, "Workspace absolute path"),
                        h("input", { type: "text", value: workspacePath, onChange: (event) => setWorkspacePath(event.target.value), className: styles.workspaceInput })))),
            h("div", { className: styles.flowRoot },
                h("ul", { className: styles.list }, debugData.map((data, index) => (h(Item, { key: index, data: data, workspacePath: workspacePath }))))))));
}
document.head.appendChild(styles.styleTag);
render(h(App, null), root);
export function mount() {
    document.body.appendChild(root);
}
export function unmount() {
    document.body.removeChild(root);
}
//# sourceMappingURL=index.js.map