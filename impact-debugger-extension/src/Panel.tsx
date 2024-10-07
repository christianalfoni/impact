import { useEffect, useReducer, useRef, useState } from "react";
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  SearchIcon,
  XIcon,
  ChevronDownIcon,
} from "lucide-react";

import { Lightning, Logo, LogoMuted } from "./Logo";
import { BackgroundScriptMessage, StoreData, StoreNode } from "./types";
import { ComponentDetails } from "./Details";
import { DebugEvent, StoreReference } from "@impact-react/store";

function buildTrees(stores: Record<string, StoreData>): StoreNode[][] {
  // Step 1: Separate stores into non-stale and stale
  const nonStaleStores: Record<string, StoreData> = {};
  const staleStores: Record<string, StoreData> = {};

  for (const id in stores) {
    if (stores[id].stale) {
      staleStores[id] = stores[id];
    } else {
      nonStaleStores[id] = stores[id];
    }
  }

  /**
   * Helper function to build a tree from a subset of stores.
   *
   * @param storesSubset - A record of store data.
   * @returns An array of root StoreNodes for the given subset.
   */
  function buildTreeSubset(
    storesSubset: Record<string, StoreData>,
  ): StoreNode[] {
    const idToNodeMap: Record<string, StoreNode> = {};

    // Create StoreNode for each store in the subset
    for (const id in storesSubset) {
      idToNodeMap[id] = {
        id,
        children: [],
        isStale: storesSubset[id].stale,
      };
    }

    const roots: StoreNode[] = [];

    // Link children to their respective parents
    for (const id in storesSubset) {
      const store = storesSubset[id];
      const node = idToNodeMap[id];

      if (store.parentId && storesSubset[store.parentId]) {
        const parentNode = idToNodeMap[store.parentId];
        parentNode.children.push(node);
      } else {
        // No parentId or parent not in the subset; treat as root
        roots.push(node);
      }
    }

    return roots;
  }

  // Step 2: Build trees for non-stale and stale stores
  const nonStaleRoots = buildTreeSubset(nonStaleStores);
  const staleRoots = buildTreeSubset(staleStores);

  // Step 3: Combine the results
  // The first array contains non-stale trees
  // Subsequent arrays contain stale trees
  return [nonStaleRoots, ...staleRoots.map((root) => [root])];
}

export default function ReactDevTool() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [stores, dispatch] = useReducer(storesReducer, {});
  const portRef = useRef<{ port: chrome.runtime.Port; tabId: number }>();

  const filterTree = (node: StoreNode): StoreNode | null => {
    const filteredChildren = node.children
      .map(filterTree)
      .filter((child): child is StoreNode => child !== null);
    if (filteredChildren.length > 0) {
      return { ...node, children: filteredChildren };
    }
    return null;
  };

  const trees = buildTrees(stores);

  const selectedComponent = selectedId ? stores[selectedId] : null;

  function sendMessageToBackgroundScript(
    message: Omit<BackgroundScriptMessage, "tabId">,
  ) {
    if (!portRef.current) {
      throw new Error("Sending message before connected to port");
    }

    portRef.current.port.postMessage({
      ...message,
      tabId: portRef.current.tabId,
    });
  }

  useEffect(() => {
    // Establish a connection with the background script
    const port = chrome.runtime.connect();

    portRef.current = {
      port,
      tabId: chrome.devtools.inspectedWindow.tabId,
    };

    sendMessageToBackgroundScript({ type: "ready" });

    port.onDisconnect.addListener(() => {
      location.reload();
    });

    // Listen for messages from the background script
    port.onMessage.addListener((payload: DebugEvent) => {
      switch (payload.type) {
        case "init": {
          setIsLoading(false);
          dispatch({
            type: "reset",
          });
          sendMessageToBackgroundScript({ type: "initialised" });
          break;
        }
        case "store_mounted": {
          dispatch({
            type: "add",
            payload: payload.storeReference,
          });

          break;
        }

        case "store_unmounted": {
          dispatch({
            type: "stale",
            payload: { id: payload.storeReference.id },
          });

          break;
        }

        case "props": {
          dispatch({
            type: "update",
            payload: {
              id: payload.storeReference.id,
              props: payload.props,
              state: undefined,
            },
          });

          break;
        }

        case "state": {
          dispatch({
            type: "update",
            payload: {
              id: payload.storeReference.id,
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
    });
  }, []);

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
    <div className="flex flex-col md:flex-row h-screen w-screen bg-zinc-900 font-mono text-white">
      {isSidebarOpen && (
        <div
          className={`flex flex-col border-b md:border-b-0 md:border-r border-zinc-800 h-1/2 md:h-full md:w-2/3`}
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
            className="flex-grow overflow-auto pr-4 pt-4 pb-10"
            onClick={() => {
              setSelectedId(null);
            }}
          >
            {(trees[0] || []).map((node, index) => (
              <TreeNode
                key={index}
                node={node}
                stores={stores}
                selectedId={selectedId}
                onSelect={setSelectedId}
                sendMessageToBackgroundScript={sendMessageToBackgroundScript}
              />
            ))}
          </div>
        </div>
      )}

      <div className={`flex-grow flex flex-col`}>
        {selectedComponent && (
          <div className="flex-grow overflow-auto relative">
            <ComponentDetails data={selectedComponent} />

            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-zinc-400 hover:text-white absolute right-2 top-2"
            >
              {isSidebarOpen ? (
                <ChevronLeftIcon className="h-5 w-5 rotate-90" />
              ) : (
                <ChevronRightIcon className="h-5 w-5 rotate-90" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function TreeNode({
  node,
  stores,
  depth = 0,
  selectedId,
  onSelect,
  sendMessageToBackgroundScript,
}: {
  node: StoreNode;
  stores: Record<string, StoreData>;
  depth?: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
  sendMessageToBackgroundScript: (message: BackgroundScriptMessage) => void;
}) {
  const data = stores[node.id];
  const [isExpanded, setIsExpanded] = useState(Boolean(node.children.length));
  const isSelected = data.id === selectedId;
  const [isHighlighted, setIsHighlighted] = useState(data.highlighted);

  useEffect(() => {});

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
          sendMessageToBackgroundScript({
            type: "highlight-store",
            data: {
              id: data.id,
            },
          });
        }}
        onMouseLeave={() => {
          sendMessageToBackgroundScript({
            type: "highlight-clean",
            data: undefined,
          });
        }}
      >
        <span
          className="mr-1 w-4 text-zinc-400 hover:text-white"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
        >
          {node.children.length > 0 &&
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
        node.children.map((child) => (
          <TreeNode
            key={child.id}
            node={child}
            stores={stores}
            depth={depth + 1}
            selectedId={selectedId}
            onSelect={onSelect}
            sendMessageToBackgroundScript={sendMessageToBackgroundScript}
          />
        ))}
    </div>
  );
}

function createChild(store: StoreReference, stale: boolean): StoreData {
  return {
    id: store.id,
    name: store.name,
    parentId: store.parent?.id,
    stateTimeline: [],
    stale,
    highlighted: false,
  };
}

type Action =
  | {
      type: "reset";
    }
  | {
      type: "add";
      payload: StoreReference;
    }
  | { type: "stale"; payload: { id: string } }
  | {
      type: "update";
      payload: {
        id: string;
        // prettier-ignore
        props?: Record<string, unknown>;
        // prettier-ignore
        state?: Record<string, unknown>;
      };
    };

function storesReducer(
  state: Record<string, StoreData>,
  action: Action,
): Record<string, StoreData> {
  console.log("ACTION", action.type, action);
  switch (action.type) {
    case "reset":
      return {};
    case "add":
      return addComponent(state, action.payload);
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
  reducerState: Record<string, StoreData>,
  id: string,
  props?: any,
  state?: any,
) {
  const item = reducerState[id];

  if (!item) {
    return reducerState;
  }

  const buildTimeline = () => {
    if (state === undefined) {
      return item.stateTimeline;
    }

    if (!item.state || deepEqual(item.state, state)) {
      return item.stateTimeline;
    }

    const diff = findObjectDifferences(item.state!, state);

    const diffTo: any = {};
    const diffFrom: any = {};
    Object.keys(diff).forEach((key) => {
      diffTo[key] = diff[key].to ?? diff[key].added;
      diffFrom[key] = diff[key].from ?? diff[key].removed;
    });

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

  return {
    ...reducerState,
    [item.id]: {
      ...item,
      ...(props !== undefined && { props }),
      ...(state !== undefined && { state }),
      stateTimeline: buildTimeline(),
      highlighted: state !== undefined,
    },
  };
}

function addComponent(state: Record<string, StoreData>, store: StoreReference) {
  return { ...state, [store.id]: createChild(store, false) };
}

function markComponentAsStale(state: Record<string, StoreData>, id: string) {
  return {
    ...state,
    [id]: {
      ...state[id],
      stale: true,
    },
  };
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
