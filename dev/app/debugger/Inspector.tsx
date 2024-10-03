import { memo, useState } from "react";
import { isArray, isObject } from "./utils";

function renderValue({
  path,
  value,
  delimiter,
  renderPaths,
  expandedPaths,
  onClickPath,
  onToggleExpand,
  onSubmitState,
  isState,
}: {
  onSubmitState?: (newState: string) => void;
  onToggleExpand: (path: string[]) => void;
  path: string;
  delimiter: string;
  value: any;
  renderPaths?: RenderPaths;
  expandedPaths: string[];
  onClickPath?: (path: string[]) => void;
  isState?: boolean;
}) {
  const wrapper = renderPaths && renderPaths[path];
  let node;

  if (isObject(value)) {
    node = (
      <Nested
        key={path}
        startBracket="{"
        endBracket="}"
        path={path}
        delimiter={delimiter}
        expandedPaths={expandedPaths}
        hasWrapper={Boolean(wrapper)}
        onClickPath={onClickPath}
        renderPaths={renderPaths}
        onToggleExpand={onToggleExpand}
        isArray={false}
        value={value}
        onSubmitState={onSubmitState}
        isState={isState}
      />
    );
  } else if (isArray(value)) {
    node = (
      <Nested
        key={path}
        startBracket="["
        endBracket="]"
        delimiter={delimiter}
        renderPaths={renderPaths}
        path={path}
        expandedPaths={expandedPaths}
        hasWrapper={Boolean(wrapper)}
        onClickPath={onClickPath}
        onToggleExpand={onToggleExpand}
        isArray
        value={value}
        onSubmitState={onSubmitState}
        isState={isState}
      />
    );
  } else {
    node = (
      <ValueComponent
        key={path}
        path={path}
        delimiter={delimiter}
        value={value}
        onClickPath={onClickPath}
        hasWrapper={Boolean(wrapper)}
        onSubmitState={onSubmitState}
        isState={isState}
      />
    );
  }

  return wrapper ? wrapper(node) : node;
}

type PathKeyProps = {
  path: string;
  onClickPath?: (path: string[]) => void;
  onToggleExpand?: (path: string[]) => void;
  disabled: boolean;
  delimiter: string;
};

const PathKey = ({
  path,
  onClickPath,
  onToggleExpand,
  disabled,
  delimiter,
}: PathKeyProps) => {
  return path.length ? (
    <span
      className="mr-1 cursor-pointer text-zinc-500"
      onClick={
        disabled
          ? undefined
          : (event) => {
              event.stopPropagation();
              if (onClickPath && (event.metaKey || event.ctrlKey)) {
                onClickPath(path.split(delimiter));
              } else if (onToggleExpand) {
                onToggleExpand(path.split(delimiter));
              }
            }
      }
    >
      {path.split(delimiter).pop()}:
    </span>
  ) : null;
};

type NestedProps = {
  startBracket: string;
  endBracket: string;
  expandedPaths: string[];
  renderPaths?: RenderPaths;
  delimiter: string;
  path: string;
  hasWrapper: boolean;
  isArray: boolean;
  value: any;
  onToggleExpand: (path: string[]) => void;
  onClickPath?: (path: string[]) => void;
  onSubmitState?: (newState: string) => void;
  isState?: boolean;
};

const Nested = memo(
  ({
    expandedPaths,
    path,
    onToggleExpand,
    onClickPath,
    startBracket,
    renderPaths,
    hasWrapper,
    endBracket,
    isArray,
    value,
    delimiter,
    onSubmitState,
    isState,
  }: NestedProps) => {
    const shouldCollapse = !expandedPaths.includes(path);
    const isClass = value.__CLASS__;

    if (shouldCollapse) {
      const keys = isClass ? Object.keys(value.value) : Object.keys(value);

      return (
        <div
          className="flex cursor-pointer items-center"
          onClick={(event) => {
            event.stopPropagation();
            onToggleExpand(path.split(delimiter));
          }}
        >
          <PathKey
            path={path}
            delimiter={delimiter}
            onClickPath={onClickPath}
            onToggleExpand={onToggleExpand}
            disabled={!onSubmitState || hasWrapper}
          />
          {startBracket}
          <span className="text-sm text-zinc-500">
            {isArray ? (
              keys.length + " items"
            ) : (
              <span className="flex cursor-pointer items-center">
                {isClass ? (
                  <span className="mr-2 text-zinc-500">{value.name}</span>
                ) : null}{" "}
                {keys.sort().slice(0, 3).join(", ") + "..."}
              </span>
            )}
          </span>
          {endBracket}
        </div>
      );
    }

    return (
      <div>
        <div
          className="flex cursor-pointer items-center text-zinc-300"
          onClick={(event) => {
            event.stopPropagation();
            onToggleExpand(path.split(delimiter));
          }}
        >
          <PathKey
            path={path}
            delimiter={delimiter}
            onClickPath={onClickPath}
            onToggleExpand={onToggleExpand}
            disabled={!onSubmitState || hasWrapper}
          />
          {startBracket}
        </div>
        <div className="pl-4">
          {Array.isArray(value)
            ? value.map((_, index) =>
                renderValue({
                  path: path.concat((path ? delimiter : "") + String(index)),
                  delimiter,
                  value: value[index],
                  renderPaths,
                  expandedPaths,
                  onClickPath,
                  onSubmitState,
                  onToggleExpand,
                  isState,
                }),
              )
            : isClass
              ? [
                  <span
                    className="flex items-center text-zinc-500"
                    key={path.concat((path ? delimiter : "") + "__CLASS__")}
                  >
                    {value.name}
                  </span>,
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
                        isState,
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
                      isState,
                    });
                  })}
        </div>
        <div className="flex cursor-default items-center text-zinc-300">
          {endBracket}
        </div>
      </div>
    );
  },
);

type ValueComponentProps = {
  value: string | number | boolean;
  path: string;
  hasWrapper: boolean;
  onClickPath?: (path: string[]) => void;
  delimiter: string;
  selectedStatePath?: string;
  onSubmitState?: (newState: string) => void;
  isState?: boolean;
};

const ValueComponent = memo(
  ({
    value,
    path,
    onClickPath,
    selectedStatePath,
    onSubmitState,
    hasWrapper,
    delimiter,
    isState,
  }: ValueComponentProps) => {
    const [isHoveringString, setHoveringString] = useState(false);

    if (
      typeof value === "string" &&
      value[0] === "[" &&
      value[value.length - 1] === "]"
    ) {
      return (
        <div className={`flex items-center`}>
          <PathKey
            path={path}
            delimiter={delimiter}
            onClickPath={onClickPath}
            disabled={!onSubmitState || hasWrapper}
          />
          {value.substr(1, value.length - 2)}
        </div>
      );
    }

    if (typeof value === "string") {
      return (
        <div className="flex items-center text-gray-100">
          <PathKey
            path={path}
            delimiter={delimiter}
            onClickPath={onClickPath}
            disabled={!onSubmitState || hasWrapper}
          />
          <div
            onMouseOver={() => setHoveringString(true)}
            onMouseOut={() => setHoveringString(false)}
            className={`${isState ? "text-cyan-400" : "text-zinc-200"}`}
          >
            {'"'}
            {value.length > 50 && !isHoveringString
              ? value.substr(0, 50) + "..."
              : value}
            {'"'}
          </div>
        </div>
      );
    }

    return (
      <div
        className={`flex items-center text-zinc-500 ${isState ? "text-cyan-400" : "text-zinc-200"}`}
      >
        <PathKey
          path={path}
          delimiter={delimiter}
          onClickPath={onClickPath}
          disabled={!onSubmitState || hasWrapper}
        />
        {String(value)}
      </div>
    );
  },
);

export type RenderPaths = {
  [path: string]: (children: any) => any;
};

type InspectorProps = {
  value: object;
  expandedPaths: string[];
  delimiter: string;
  small?: boolean;
  onToggleExpand: (path: string[]) => void;
  onClickPath?: (path: string[]) => void;
  renderPaths?: RenderPaths;
  onSubmitState?: (newState: string) => void;
  isState?: boolean;
};

const Inspector = ({
  value,
  expandedPaths,
  onToggleExpand,
  delimiter,
  onClickPath = () => {},
  renderPaths,
  onSubmitState,
  isState,
}: InspectorProps) => {
  return (
    <div>
      {renderValue({
        path: "",
        delimiter,
        value,
        renderPaths,
        expandedPaths,
        onClickPath,
        onToggleExpand,
        onSubmitState,
        isState,
      })}
    </div>
  );
};

export default Inspector;
