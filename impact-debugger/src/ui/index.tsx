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

type CodeLocation = {
  name: string;
  path: string;
};

type ObserverType = "component" | "effect" | "derived";

type Observer = CodeLocation & {
  type: ObserverType;
};

type DebugData =
  | {
      type: "signal";
      source: CodeLocation;
      target: CodeLocation;
      observers: Observer[];
      value: any;
    }
  | {
      type: "derived";
    }
  | {
      type: "effect";
    };

let currentDebugData: DebugData[] = [];

let currentSubscriber: undefined | ((data: DebugData[]) => void);

export function addDebugData(data: DebugData) {
  currentDebugData = [data, ...currentDebugData];
  currentSubscriber?.(currentDebugData);
}

function useWorkspacePath() {
  const [workspacePath, setWorkspacePath] = useState(
    localStorage.getItem("impact.debugger.workspacePath") || "",
  );

  useEffect(() => {
    if (workspacePath) {
      localStorage.setItem("impact.debugger.workspacePath", workspacePath);
    }
  }, [workspacePath]);

  return [workspacePath, setWorkspacePath] as const;
}

function CodeReference({
  name,
  path,
  workspacePath,
  type,
}: CodeLocation & { type?: ObserverType; workspacePath: string }) {
  return (
    <span className="impact-debugger-tooltip">
      <span className={styles.tooltip}>{path}</span>
      <a
        href={
          "vscode://file/" +
          (workspacePath.startsWith("/")
            ? workspacePath.substring(1)
            : workspacePath) +
          path
        }
        className={styles.itemLink}
        style={
          type
            ? {
                color:
                  type === "component"
                    ? styles.colors.blue
                    : type === "effect"
                    ? styles.colors.purple
                    : styles.colors.green,
              }
            : undefined
        }
      >
        {name}
      </a>
    </span>
  );
}

function Item({
  data,
  workspacePath,
}: {
  data: DebugData;
  workspacePath: string;
}) {
  let content;
  if (data.type === "signal") {
    const observers = data.observers.slice();
    const lastObserver = observers.pop();

    content = (
      <Fragment>
        <div>
          <span className={styles.circle}>{data.observers.length}</span>
        </div>
        <div className={styles.itemContent}>
          <div className={styles.itemTextContent}>
            Signal changed in{" "}
            <CodeReference
              workspacePath={workspacePath}
              name={data.target.name}
              path={data.target.path}
            />{" "}
            with the value{" "}
            <span className={styles.itemValue}>
              <ValueInspector delimiter="." value={data.value} />
            </span>
            . Called from{" "}
            <CodeReference
              workspacePath={workspacePath}
              name={data.source.name}
              path={data.source.path}
            />
            . Observed by{" "}
            {observers.length ? (
              <>
                {observers.map((observer, index) => (
                  <>
                    <CodeReference
                      key={index}
                      workspacePath={workspacePath}
                      {...observer}
                    />
                    {index === observers.length - 1 ? " " : ", "}
                  </>
                ))}{" "}
                and{" "}
              </>
            ) : null}
            {lastObserver ? (
              <CodeReference workspacePath={workspacePath} {...lastObserver} />
            ) : null}
          </div>
          <div></div>
        </div>
      </Fragment>
    );
  }

  return (
    <li>
      <div className={styles.itemWrapper}>
        <span className={styles.line} />
        <div className={styles.itemContentWrapper}>{content}</div>
      </div>
    </li>
  );
}

function App() {
  const debugData = useSyncExternalStore(
    (update) => {
      currentSubscriber = update;
      return () => {
        currentSubscriber = undefined;
      };
    },
    () => currentDebugData,
  );
  const [workspacePath, setWorkspacePath] = useWorkspacePath();

  return (
    <div className={styles.wrapper}>
      <div className={styles.innerWrapper}>
        <div className={styles.workspaceWrapper}>
          <div className={styles.workspaceInnerWrapper}>
            <div>
              <label className={styles.workspaceLabel}>
                Workspace absolute path
              </label>
              <input
                type="text"
                value={workspacePath}
                onChange={(event) => setWorkspacePath(event.target.value)}
                className={styles.workspaceInput}
              />
            </div>
          </div>
        </div>
        <div className={styles.flowRoot}>
          <ul className={styles.list}>
            {debugData.map((data, index) => (
              <Item key={index} data={data} workspacePath={workspacePath} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

document.head.appendChild(styles.styleTag);

render(<App />, root);

export function mount() {
  document.body.appendChild(root);
}

export function unmount() {
  document.body.removeChild(root);
}
