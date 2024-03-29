import { Fragment, h, render } from "preact";
import * as styles from "./styles";
import * as icons from "./icons";
import { useEffect, useState } from "preact/hooks";
import ValueInspector from "./ValueInspector";

const root = document.createElement("div");

root.style.position = "fixed";
root.style.zIndex = "99999999999999999999";
root.style.top = "0px";
root.style.right = "0px";

function debounce<T extends any[]>(func: (...args: T) => any, timeout: number) {
  let timer: number;
  return (...args: T) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, timeout) as unknown as number;
  };
}

type CodeLocation = {
  name: string;
  path: string;
};

type ObserverType = "component" | "effect" | "derived";

type Observer = CodeLocation & {
  type: ObserverType;
};

type DebugDataDTO =
  | {
      id: number;
      type: "signal";
      source: CodeLocation;
      target: CodeLocation;
      observers: Observer[];
      value: any;
    }
  | {
      id: number;
      type: "derived";
      source: CodeLocation;
      target: CodeLocation;
      observers: Observer[];
      value: any;
    }
  | { id: number; type: "effect"; name: string; target: CodeLocation };

type DebugData = DebugDataDTO & { isStale: boolean };

let currentDebugData: DebugData[] = [];

let currentSubscriber: undefined | ((data: DebugData[]) => void);

export function addDebugData(data: DebugDataDTO) {
  currentDebugData = [
    ...currentDebugData,
    {
      ...data,
      isStale: false,
    },
  ].sort((a, b) => b.id - a.id);
  currentSubscriber?.(currentDebugData);
  makeLastStale();
}

function resetDebugData() {
  currentDebugData = [];
  currentSubscriber?.(currentDebugData);
}

const makeLastStale = debounce(() => {
  currentDebugData = [
    {
      ...currentDebugData[0],
      isStale: true,
    },
    ...currentDebugData.slice(1),
  ];
  currentSubscriber?.(currentDebugData);
}, 2000);

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

function mergeObservers(observers: Observer[]) {
  return observers.reduce<Array<{ observer: Observer; count: number }>>(
    (acc, observer) => {
      const existing = acc.find(
        (accObserver) =>
          accObserver.observer.name === observer.name &&
          accObserver.observer.path.split(":")[0] ===
            observer.path.split(":")[0] &&
          accObserver.observer.type === observer.type,
      );

      if (existing) {
        existing.count++;

        return acc;
      }

      return acc.concat({
        count: 1,
        observer,
      });
    },
    [],
  );
}

// @ts-ignore
const csbFocusFile = window.CODESANDBOX_PREVIEW?.focusFile;

function Item({
  data,
  workspacePath,
}: {
  data: DebugData;
  workspacePath: string;
}) {
  const [open, setOpen] = useState(false);

  const renderTitle = () => {
    let title: string;
    const fileName = data.target.path.split("/").pop()!.split(".")[0]!;

    if (data.type === "derived") {
      title = data.target.name;
    } else if (data.type === "effect") {
      title = data.name;
    } else {
      title = data.target.name;
    }

    const [relativePath, line] = data.target.path.split(":");

    return (
      <span style={{ display: "flex", gap: ".6em", minWidth: 0 }}>
        <span
          style={{
            cursor: "pointer",
          }}
          onClick={
            csbFocusFile
              ? () => {
                  csbFocusFile(
                    "/" + workspacePath + relativePath,
                    Number(line),
                  );
                }
              : undefined
          }
        >
          <span style={styles.colors[10]}>{fileName}.</span>
          <span style={styles.colors[12]}>{title}</span>
          <span style={styles.colors[10]}>();</span>{" "}
        </span>
      </span>
    );
  };

  const renderLine = () => {
    if (data.type === "signal") {
      return (
        <span
          style={{
            ...styles.list.headerLine,
            background: "#00F0FF",
          }}
        />
      );
    }

    if (data.type === "effect") {
      return (
        <div style={styles.list.startTimeline}>
          <span
            style={{
              ...styles.list.startTimelineItem,
              background: styles.palette[10],
            }}
          />
          <span
            style={{
              ...styles.list.startTimelineItem,
              background: styles.palette[10],
            }}
          />
          <span
            style={{
              ...styles.list.startTimelineItem,
              background: styles.palette[10],
            }}
          />
          <span
            style={{
              ...styles.list.startTimelineItem,
              background: styles.palette[10],
            }}
          />
        </div>
      );
    }

    return <span style={styles.list.headerLine} />;
  };

  return (
    <Fragment>
      {data.isStale && (
        <span style={styles.list.header}>
          <span style={styles.list.staleLine} />
        </span>
      )}
      <span style={styles.list.header}>
        <span
          style={{
            ...styles.list.headerText,
            gap: "1.1em",
            height: 22,
          }}
        >
          {renderLine()}
          {renderTitle()}
        </span>

        {(data.type === "signal" || data.type === "derived") && (
          <span
            onClick={() => setOpen(!open)}
            style={{
              cursor: "pointer",
              color: styles.palette[11],
              rotate: open ? "0deg" : "180deg",
              padding: ".5em",
            }}
          >
            {icons.chevron}
          </span>
        )}
      </span>

      <div style={{ position: "relative", display: open ? "block" : "none" }}>
        {(data.type === "signal" || data.type === "derived") && (
          <Fragment>
            <span style={styles.list.contentLine} />

            <span style={styles.list.contentItem}>
              {icons.pencil}
              <span style={styles.colors[12]}>
                <ValueInspector value={data.value} delimiter="." />
              </span>
            </span>

            {data.source && (
              <span style={styles.list.contentItem}>
                {icons.lightingBolt}
                <span
                  onClick={
                    csbFocusFile
                      ? () => {
                          const [relativePath, line] =
                            data.source.path.split(":");
                          csbFocusFile(
                            "/" + workspacePath + relativePath,
                            Number(line),
                          );
                        }
                      : undefined
                  }
                  style={{ ...styles.colors[12], cursor: "pointer" }}
                >
                  {data.source.name}
                </span>
              </span>
            )}

            {data.observers && (
              <Fragment>
                <span style={styles.list.contentItem}>
                  <div style={{ minWidth: 12 }}>{icons.eye}</div>

                  <span style={styles.list.contentItemList}>
                    {data.observers.length > 0 && (
                      <>
                        {mergeObservers(data.observers).map(
                          ({ observer, count }, index) => (
                            <span
                              key={index}
                              style={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                cursor: "pointer",
                                ...styles.colors[12],
                              }}
                              onClick={
                                csbFocusFile
                                  ? () => {
                                      const [relativePath, line] =
                                        observer.path.split(":");
                                      csbFocusFile(
                                        "/" + workspacePath + relativePath,
                                        Number(line),
                                      );
                                    }
                                  : undefined
                              }
                            >
                              {observer.name}
                              {count > 1 ? `(${count})` : null}
                            </span>
                          ),
                        )}
                      </>
                    )}
                  </span>
                </span>
              </Fragment>
            )}
          </Fragment>
        )}
      </div>
    </Fragment>
  );
}

function App() {
  const [debugData, setDebugData] = useState<DebugData[]>(currentDebugData);
  const [workspacePath, setWorkspacePath] = useWorkspacePath();
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    currentSubscriber = setDebugData;
  }, []);

  if (!opened) {
    return (
      <div style={styles.impactButton} onClick={() => setOpened(true)}>
        {icons.dev}
      </div>
    );
  }

  return (
    <>
      <div style={{ ...styles.impactButton, left: 300 }}>{icons.dev}</div>

      <div style={styles.impactBoundary}>
        <div style={styles.body}>
          {/* Header */}
          <div style={styles.header}>
            <span style={styles.colors[12]}>
              Impact <span style={styles.colors[12]}>debugger</span>
              <span style={styles.colors[10]}>;</span>
            </span>

            <div style={styles.workspaceInputWrapper}>
              <span style={styles.colors[7]}>//</span>
              <input
                style={styles.workspace}
                type="text"
                placeholder="Base path..."
                value={workspacePath}
                // @ts-ignore
                onChange={(event) => setWorkspacePath(event.target.value)}
              />
            </div>

            <span
              style={{ cursor: "pointer", color: styles.palette[11] }}
              onClick={resetDebugData}
            >
              {icons.clean}
            </span>

            <span
              style={{ cursor: "pointer", color: styles.palette[11] }}
              onClick={() => setOpened(false)}
            >
              {icons.cross}
            </span>
          </div>

          {/* List */}
          <div style={styles.list.container}>
            {/* Start timeline */}
            <div style={styles.list.startTimeline}>
              <span
                style={{
                  ...styles.list.startTimelineItem,
                  background: styles.palette[5],
                }}
              />
              <span
                style={{
                  ...styles.list.startTimelineItem,
                  background: styles.palette[6],
                }}
              />
              <span
                style={{
                  ...styles.list.startTimelineItem,
                  background: styles.palette[7],
                }}
              />
              <span
                style={{
                  ...styles.list.startTimelineItem,
                  background: styles.palette[8],
                }}
              />
            </div>

            {debugData.map((data) => (
              <Item key={data.id} data={data} workspacePath={workspacePath} />
            ))}

            {/* End timeline */}
            <div style={styles.list.startTimeline}>
              <span
                style={{
                  ...styles.list.startTimelineItem,
                  background: styles.palette[8],
                }}
              />
              <span
                style={{
                  ...styles.list.startTimelineItem,
                  background: styles.palette[7],
                }}
              />
              <span
                style={{
                  ...styles.list.startTimelineItem,
                  background: styles.palette[6],
                }}
              />
              <span
                style={{
                  ...styles.list.startTimelineItem,
                  background: styles.palette[5],
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

render(<App />, root);

export function mount() {
  document.body.appendChild(root);
}

export function unmount() {
  document.body.removeChild(root);
}
