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
      target: CodeLocation;
      observers: Observer[];
      value: any;
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

// @ts-ignore
const csbFocusFile = window.CODESANDBOX_PREVIEW?.focusFile;

const Item = ({ data }: { data: DebugData }) => {
  const [open, setOpen] = useState(false);

  if (data.type === "effect") {
    return null;
  }

  const renderTitle = () => {
    if (data.type === "derived") {
      return "Derived";
    }

    return (
      <span>
        <span>{data.target.name}</span>
        <span style={styles.colors[10]}>();</span>{" "}
        <span style={styles.colors[7]}>// {data.target.path}</span>
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

    return <span style={styles.list.headerLine} />;
  };

  return (
    <Fragment>
      <button style={styles.list.header} onClick={() => setOpen(!open)}>
        <span style={styles.list.headerText}>
          {renderLine()}
          {renderTitle()}
        </span>
        <span
          style={{
            color: styles.palette[11],
            rotate: open ? "0deg" : "180deg",
          }}
        >
          {icons.chevron}
        </span>
      </button>

      <div style={{ position: "relative", display: open ? "block" : "none" }}>
        <span style={styles.list.contentLine} />

        <span style={styles.list.contentItem}>
          {icons.pencil}
          <span style={styles.colors[11]}>
            <ValueInspector value={data.value} delimiter="." />
          </span>
          <span style={{ ...styles.colors[7], cursor: "pointer" }}>
            {" "}
            // {typeof data.value}
          </span>
        </span>

        {data.source && (
          <span style={styles.list.contentItem}>
            {icons.lightingBolt}
            <span style={styles.colors[11]}>{data.source.name}</span>
            <span style={{ ...styles.colors[7], cursor: "pointer" }}>
              {" "}
              // {data.source.path}
            </span>
          </span>
        )}

        {data.observers && data.observers.length > 0 && (
          <>
            {data.observers.map(({ name, path }, index) => (
              <span style={styles.list.contentItem} key={index}>
                {icons.eye}
                <span style={styles.colors[11]}>{name}</span>
                <span style={{ ...styles.colors[7], cursor: "pointer" }}>
                  {" "}
                  // {path}
                </span>
              </span>
            ))}
          </>
        )}
      </div>
    </Fragment>
  );
};

function App() {
  const [debugData, setDebugData] = useState<DebugData[]>(currentDebugData);
  const [workspacePath, setWorkspacePath] = useWorkspacePath();

  useEffect(() => {
    currentSubscriber = setDebugData;
  }, []);

  return (
    <>
      <div style={{ ...styles.impactButton, left: 300 }}>{icons.dev}</div>

      <div style={styles.impactBoundary}>
        <div style={styles.body}>
          {/* Header */}
          <div style={styles.header}>
            <span style={styles.colors[12]}>
              Impact <span style={styles.colors[11]}>debugger</span>
              <span style={styles.colors[10]}>;</span>
            </span>

            <div style={styles.header}>
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

            <span style={{ cursor: "pointer", color: styles.palette[11] }}>
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

            {debugData.map((data, index) => (
              <Item key={index} data={data} />
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
