"use client";

import { useEffect, useReducer, useState } from "react";
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  SearchIcon,
  XIcon,
  ChevronDownIcon,
} from "lucide-react";

import { Lightning, Logo, LogoMuted } from "./Logo";
import { ComponentData } from "./types";
import { ComponentDetails } from "./Details";
import { types, DebuggerProtocolSender } from "impact-react-debugger";

const protocolSender = new DebuggerProtocolSender(window.parent);

export default function ReactDevTool() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [store, dispatch] = useReducer(storeReducer, []);

  const filterTree = (node: ComponentData): ComponentData | null => {
    if (node.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      return node;
    }
    const filteredChildren = node.children
      .map(filterTree)
      .filter((child): child is ComponentData => child !== null);
    if (filteredChildren.length > 0) {
      return { ...node, children: filteredChildren };
    }
    return null;
  };

  const filteredTrees = store
    .map((tree) => (searchTerm ? filterTree(tree) : tree))
    .filter((tree): tree is ComponentData => tree !== null);

  const selectedComponent = findComponentById(store, selectedId);

  useEffect(() => {
    const bridge = (e: MessageEvent) => {
      if (e.data.source === "impact-react-debugger") {
        const payload = e.data.event;

        switch (payload.type) {
          case "connected": {
            setIsLoading(false);

            break;
          }

          case "props":
          case "store_unmounted":
          case "store_mounted": {
            // ignore
            break;
          }

          case "store_mounted_debugger": {
            dispatch({
              type: "add",
              payload: payload.store,
              reactFiberId: payload.reactFiberId,
            });

            break;
          }

          case "store_unmounted_debugger": {
            dispatch({
              type: "stale",
              payload: { id: payload.storeRefId },
            });

            break;
          }

          case "props_debugger": {
            dispatch({
              type: "update",
              payload: {
                id: payload.storeRefId,
                props: payload.props,
                state: undefined,
              },
            });

            break;
          }

          case "state_debugger": {
            dispatch({
              type: "update",
              payload: {
                id: payload.storeRefId,
                props: undefined,
                state: payload.state,
              },
            });

            break;
          }

          default: {
            console.log("[debugger]: event not handled -> ", payload);
          }
        }
      }
    };

    window.addEventListener("message", bridge);
    return () => {
      window.removeEventListener("message", bridge);
    };
  }, [store]);

  if (isLoading) {
    return (
      <div className="flex h-screen bg-zinc-900 font-mono text-zinc-600">
        <div className="m-auto flex flex-col items-center">
          <LogoMuted className="h-16 w-16" />

          <p className="mt-4 animate-pulse text-center">Loading</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-zinc-900 font-mono text-white">
      {isSidebarOpen && (
        <div
          className={`flex flex-col border-r border-zinc-800 ${selectedComponent ? "w-1/2" : "w-full"}`}
        >
          <div className="flex items-center border-b border-zinc-800 px-4 py-4">
            <Logo />

            <div className="relative w-full">
              <SearchIcon className="absolute left-2 top-2 mr-2 h-3 w-3 text-zinc-400" />
              <input
                type="text"
                placeholder="Search stores"
                className="w-full rounded bg-zinc-800 p-1 pl-6 text-sm text-white placeholder-zinc-400 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-2 ml-2 text-zinc-400 hover:text-white"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div
            className="flex-grow overflow-auto pr-4 pt-4"
            onClick={() => {
              setSelectedId(null);
            }}
          >
            {filteredTrees.map((tree, index) => (
              <TreeNode
                key={index}
                data={tree}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            ))}
          </div>
        </div>
      )}
      {selectedComponent && (
        <div
          className={`flex-grow ${isSidebarOpen ? "" : "w-full"} flex flex-col`}
        >
          <div className="flex items-center justify-between p-4 pb-0 pt-5">
            <h2 className="text-sm text-zinc-400">Store Details</h2>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-zinc-400 hover:text-white"
            >
              {isSidebarOpen ? (
                <ChevronLeftIcon className="h-5 w-5" />
              ) : (
                <ChevronRightIcon className="h-5 w-5" />
              )}
            </button>
          </div>
          <div className="flex-grow overflow-auto">
            <ComponentDetails data={selectedComponent} />
          </div>
        </div>
      )}
    </div>
  );
}

function TreeNode({
  data,
  depth = 0,
  selectedId,
  onSelect,
}: {
  data: ComponentData;
  depth?: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isSelected = data.id === selectedId;
  const [isHighlighted, setIsHighlighted] = useState(data.highlighted);

  useEffect(() => {
    const debounce = setTimeout(() => {
      setIsHighlighted(data.highlighted);
    }, 200);

    const timer = setTimeout(() => {
      setIsHighlighted(false);
    }, 5_000);

    return () => {
      clearTimeout(timer);
      clearTimeout(debounce);
    };
  }, [data]);

  return (
    <div className="ml-4">
      <div
        className={`mb-1 flex cursor-pointer items-center rounded border p-1 transition-colors hover:bg-zinc-800 ${
          isSelected ? "border-cyan-400 bg-zinc-800" : "border-transparent"
        }`}
        onClick={(event) => {
          onSelect(data.id);
          event.stopPropagation();
        }}
        onMouseEnter={() => {
          protocolSender.sendMessage("highlight-element", {
            reactFiberId: data.reactFiberId,
            componentDisplayName: data.name,
          });
        }}
        onMouseLeave={() => {
          protocolSender.sendMessage("highlight-clean");
        }}
      >
        <span
          className="mr-1 w-4 text-zinc-400 hover:text-white"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
        >
          {data.children.length > 0 &&
            (isExpanded ? (
              <ChevronDownIcon className="h-4 w-4" />
            ) : (
              <ChevronRightIcon className="h-4 w-4" />
            ))}
        </span>
        <span
          className={`flex flex-1 items-center justify-between text-sm ${
            isSelected ? "text-white" : "text-zinc-400"
          }`}
        >
          <span>{data.name}</span>

          <div className="flex gap-2">
            {data.stale && (
              <span className="inline-flex rounded-md bg-orange-500/10 px-2 py-1 text-[10px] leading-[1.1] text-orange-500 ring-1 ring-inset ring-orange-500/40">
                Unmounted
              </span>
            )}

            {!data.stale && isHighlighted && (
              <span className="animate-fadeIn relative inline-flex items-center rounded-md bg-cyan-400/10 px-2 py-1 pl-5 text-[10px] leading-[1.1] text-cyan-400 ring-1 ring-inset ring-cyan-400/40">
                <span className="absolute left-2 top-[5px] inline-flex h-2 w-2 animate-ping rounded-full bg-cyan-400 opacity-30"></span>
                <Lightning className="absolute left-1.5 top-[3px] z-10 h-3 w-3" />
                <span>Updated</span>
              </span>
            )}
          </div>
        </span>
      </div>
      {isExpanded &&
        data.children.map((child) => (
          <TreeNode
            key={child.id}
            data={child}
            depth={depth + 1}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        ))}
    </div>
  );
}

function createChild(
  store: types.SerializedStore,
  reactFiberId: number,
  stale: boolean,
): ComponentData {
  return {
    id: store.id,
    name: store.name,
    props: null,
    state: null,
    stateTimeline: [],
    children: [],
    stale,
    reactFiberId,
    highlighted: false,
  };
}

type Action =
  | {
      type: "add";
      payload: types.SerializedStore;
      reactFiberId: number;
    }
  | { type: "stale"; payload: { id: string } }
  | {
      type: "update";
      payload: {
        id: string;
        // prettier-ignore
        props?: Record<string, any>;
        // prettier-ignore
        state?: Record<string, any>;
      };
    };

function storeReducer(state: ComponentData[], action: Action): ComponentData[] {
  switch (action.type) {
    case "add":
      return addComponent(state, action.payload, action.reactFiberId);
    case "stale":
      return markComponentAsStale(state, action.payload.id);
    case "update":
      return updateComponent(
        state,
        action.payload.id,
        action.payload.props,
        action.payload.state,
      );
    default:
      return state;
  }
}

function updateComponent(
  stateReducer: ComponentData[],
  id: string,
  props?: any,
  state?: any,
): ComponentData[] {
  return stateReducer.map((item) => {
    const buildTimeline = () => {
      if (state === undefined) {
        return item.stateTimeline;
      }

      if (item.state === null || deepEqual(item.state, state)) {
        return item.stateTimeline;
      }

      const diff = findObjectDifferences(item.state!, state);

      const diffTo = {};
      const diffFrom = {};
      Object.keys(diff).forEach((key) => {
        diffTo[key] = diff[key].to ?? diff[key].added;
        diffFrom[key] = diff[key].from ?? diff[key].removed;
      });

      console.log(diff, diffTo);

      return [
        {
          timestamp: Date.now(),
          key: Date.now() + JSON.stringify(state),
          newValue: diffTo,
          oldValue: diffFrom,
        },
        ...item.stateTimeline,
      ];
    };

    if (item.id === id) {
      return {
        ...item,
        ...(props !== undefined && { props }),
        ...(state !== undefined && { state }),
        stateTimeline: buildTimeline(),
        highlighted: state !== undefined,
      };
    }

    return {
      ...item,
      children: updateComponent(item.children, id, props, state),
    };
  });
}

function addComponent(
  state: ComponentData[],
  store: types.SerializedStore,
  reactFiberId: number,
): ComponentData[] {
  if (!store.parent) {
    return state.some((item) => item.id === store.id)
      ? state.map((item) =>
          item.id === store.id ? { ...item, stale: false } : item,
        )
      : [...state, createChild(store, reactFiberId, false)];
  }

  return state.map((item) => {
    if (item.id === store.parent!.id) {
      const existingChildIndex = item.children.findIndex(
        (child) => child.id === store.id,
      );

      if (existingChildIndex !== -1) {
        // If child exists and is stale, remove it
        if (item.children[existingChildIndex].stale) {
          const newChildren = [...item.children];
          newChildren.splice(existingChildIndex, 1);
          return {
            ...item,
            children: [...newChildren, createChild(store, reactFiberId, false)],
          };
        }
        // If child exists and is not stale, don't modify
        return item;
      }

      // If child doesn't exist, add it
      return {
        ...item,
        children: [...item.children, createChild(store, reactFiberId, false)],
      };
    }

    return {
      ...item,
      children: addComponent(item.children, store, reactFiberId),
    };
  });
}

function markComponentAsStale(
  state: ComponentData[],
  id: string,
): ComponentData[] {
  return state.map((item) => {
    if (item.id === id) {
      return { ...item, stale: true };
    }

    return {
      ...item,
      children: markComponentAsStale(item.children, id),
    };
  });
}

function findComponentById(
  trees: ComponentData[],
  id: string | null,
): ComponentData | undefined {
  for (const tree of trees) {
    if (tree.id === id) return tree;
    const found = findComponentById(tree.children, id);
    if (found) return found;
  }
  return undefined;
}

function deepEqual(obj1: Record<string, any>, obj2: Record<string, any>) {
  // Check if both inputs are objects
  if (typeof obj1 !== "object" || typeof obj2 !== "object") {
    return obj1 === obj2;
  }

  // Check if both are null (typeof null is 'object')
  if (obj1 === null || obj2 === null) {
    return obj1 === obj2;
  }

  // Check if they're the same object
  if (obj1 === obj2) {
    return true;
  }

  // Get the keys of both objects
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  // Check if they have the same number of properties
  if (keys1.length !== keys2.length) {
    return false;
  }

  // Recursively compare all properties
  for (let key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
}

type Difference = {
  added?: unknown;
  removed?: unknown;
  from?: unknown;
  to?: unknown;
};

type DifferenceResult = {
  [key: string]: Difference;
};

function findObjectDifferences(
  obj1: Record<string, any>,
  obj2: Record<string, any>,
): DifferenceResult {
  const differences: DifferenceResult = {};

  function compareObjects(
    object1: Record<string, any>,
    object2: Record<string, any>,
    path: string = "",
  ): void {
    const allKeys = new Set([...Object.keys(object1), ...Object.keys(object2)]);

    for (const key of allKeys) {
      const value1 = object1[key];
      const value2 = object2[key];
      const currentPath = path ? `${path}.${key}` : key;

      if (!(key in object1)) {
        differences[currentPath] = { added: value2 };
      } else if (!(key in object2)) {
        differences[currentPath] = { removed: value1 };
      } else if (typeof value1 !== typeof value2) {
        differences[currentPath] = { from: value1, to: value2 };
      } else if (
        typeof value1 === "object" &&
        value1 !== null &&
        value2 !== null
      ) {
        compareObjects(value1, value2, currentPath);
      } else if (value1 !== value2) {
        differences[currentPath] = { from: value1, to: value2 };
      }
    }
  }

  compareObjects(obj1, obj2);
  return differences;
}
