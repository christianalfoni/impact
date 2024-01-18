import { render, h, Fragment } from "preact";
import ValueInspector from "./ValueInspector";
import * as styles from "./styles";
import { useState, useSyncExternalStore, useEffect } from "preact/compat";

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
      source: CodeLocation;
      observers: Observer[];
      value: any;
    }
  | {
      type: "effect";
    };

let currentDebugData: DebugData[] = [];

let currentSubscriber: undefined | ((data: DebugData[]) => void);

export function addDebugData(data: DebugData) {
  currentDebugData = [...currentDebugData, data];
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

// @ts-ignore
const csbFocusFile = window.CODESANDBOX_PREVIEW?.focusFile;

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
          csbFocusFile
            ? "#"
            : "vscode://file/" +
              (workspacePath.startsWith("/")
                ? workspacePath.substring(1)
                : workspacePath) +
              path
        }
        onClick={
          csbFocusFile
            ? () => {
                const [relativePath, line] = path.split(":");
                csbFocusFile("/" + workspacePath + relativePath, Number(line));
              }
            : undefined
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
          <span
            className={styles.circle}
            style={{
              backgroundColor: styles.colors.yellow,
            }}
          >
            {data.observers.length}
          </span>
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
  } else if (data.type === "derived") {
    const observers = data.observers.slice();
    const lastObserver = observers.pop();

    content = (
      <Fragment>
        <div>
          <span
            className={styles.circle}
            style={{
              backgroundColor: styles.colors.green,
            }}
          >
            {data.observers.length}
          </span>
        </div>
        <div className={styles.itemContent}>
          <div className={styles.itemTextContent}>
            Derived calculated from{" "}
            <CodeReference
              workspacePath={workspacePath}
              name={data.source.name}
              path={data.source.path}
            />{" "}
            creating the value{" "}
            <span className={styles.itemValue}>
              <ValueInspector delimiter="." value={data.value} />
            </span>
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

function Events({ data }: { data: DebugData[] }) {
  const [workspacePath, setWorkspacePath] = useWorkspacePath();

  return (
    <div className={styles.wrapper}>
      <div className={styles.innerWrapper}>
        {
          <div className={styles.workspaceWrapper}>
            <div className={styles.workspaceInnerWrapper}>
              {csbFocusFile ? (
                <div>
                  <label className={styles.workspaceLabel}>
                    Workspace relative path
                  </label>
                  <input
                    type="text"
                    value={workspacePath}
                    // @ts-ignore
                    onChange={(event) => setWorkspacePath(event.target.value)}
                    className={styles.workspaceInput}
                  />
                  <p className={styles.workspaceHint}>
                    In CodeSandbox explorer, select the folder your dev server
                    runs from and right click to <b>copy relative path</b>
                  </p>
                </div>
              ) : (
                <div>
                  <label className={styles.workspaceLabel}>
                    Workspace absolute path
                  </label>
                  <input
                    type="text"
                    value={workspacePath}
                    // @ts-ignore
                    onChange={(event) => setWorkspacePath(event.target.value)}
                    className={styles.workspaceInput}
                  />
                  <p className={styles.workspaceHint}>
                    In VSCode explorer, select the folder your dev server runs
                    from and right click to <b>copy path</b>
                  </p>
                </div>
              )}
            </div>
          </div>
        }
        <div className={styles.flowRoot}>
          <ul className={styles.list}>
            {data.map((item, index) => (
              <Item key={index} data={item} workspacePath={workspacePath} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const debugData = useSyncExternalStore(
    (update) => {
      currentSubscriber = update;
      return () => {
        currentSubscriber = undefined;
      };
    },
    () => currentDebugData,
  );

  return (
    <Fragment>
      <div className={styles.indicatorHover} onClick={() => setIsOpen(!isOpen)}>
        <div
          className={styles.indicatorWrapper}
          style={{
            backgroundColor: debugData.length
              ? styles.colors.green.replace("1)", "0.2)")
              : undefined,
          }}
        >
          <div
            className={styles.indicator}
            style={{
              backgroundColor: debugData.length
                ? styles.colors.green
                : styles.colors.text,
            }}
          />
        </div>
      </div>
      {isOpen ? <Events data={debugData} /> : null}
    </Fragment>
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
