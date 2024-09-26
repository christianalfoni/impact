"use client";

import { useEffect, useReducer, useState } from "react";
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  SearchIcon,
  XIcon,
  ChevronDownIcon,
} from "lucide-react";

import { Logo, LogoMuted } from "./Logo";
import { ComponentData } from "./types";
import { ComponentDetails } from "./Details";
import { types } from "impact-react-debugger";

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
    const bridge = (e: MessageEvent<types.DebugData>) => {
      if (e.data.source === "impact-react-debugger") {
        const payload = e.data.event;

        switch (payload.type) {
          case "connected": {
            setIsLoading(false);

            break;
          }

          default: {
            console.log("[debugger]: event not handled -> ", payload);
          }
        }

        // if ("connected" in payload) {
        //   setIsLoading(false);

        //   return;
        // } else if ("store_mounted" in payload) {
        //   dispatch({
        //     type: "add",
        //     payload: payload.store_mounted,
        //   });

        //   return;
        // } else if ("store_unmounted" in payload) {
        //   dispatch({
        //     type: "stale",
        //     payload: { id: payload.store_unmounted.storeRefId },
        //   });

        //   return;
        // } else {
        //   console.log("unknown payload");
        //   console.log(payload);
        // }
      }
    };

    window.addEventListener("message", bridge);
    return () => {
      window.removeEventListener("message", bridge);
    };
  }, [store]);

  if (isLoading) {
    return (
      <div className="bg-zinc-900 text-zinc-600 h-screen font-mono flex">
        <div className="m-auto flex flex-col items-center">
          <LogoMuted className="w-16 h-16" />

          <p className="text-center mt-4">Loading</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 text-white h-screen flex font-mono">
      {isSidebarOpen && (
        <div className="w-1/2 border-r border-zinc-800 flex flex-col">
          <div className="px-4 py-4 border-b border-zinc-800 flex items-center">
            <Logo />

            <div className="relative w-full">
              <SearchIcon className="w-3 h-3 text-zinc-400 mr-2 absolute top-2 left-2" />
              <input
                type="text"
                placeholder="Search stores"
                className="bg-zinc-800 text-white text-sm placeholder-zinc-400 w-full p-1 pl-6 rounded outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute top-2 right-2 ml-2 text-zinc-400 hover:text-white"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="overflow-auto flex-grow pt-4 pr-4">
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
      <div
        className={`flex-grow ${isSidebarOpen ? "" : "w-full"} flex flex-col`}
      >
        <div className="p-4 pb-0 pt-5 flex justify-between items-center">
          <h2 className="text-sm text-zinc-400">Store Details</h2>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-zinc-400 hover:text-white"
          >
            {isSidebarOpen ? (
              <ChevronLeftIcon className="w-5 h-5" />
            ) : (
              <ChevronRightIcon className="w-5 h-5" />
            )}
          </button>
        </div>
        <div className="flex-grow overflow-auto">
          <ComponentDetails data={selectedComponent} />
        </div>
      </div>
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

  return (
    <div className="ml-4">
      <div
        className={`border flex items-center cursor-pointer hover:bg-zinc-800 p-1 mb-1 rounded ${
          isSelected ? "bg-zinc-800 border-cyan-400" : "border-transparent "
        }`}
        onClick={() => onSelect(data.id)}
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
              <ChevronDownIcon className="w-4 h-4" />
            ) : (
              <ChevronRightIcon className="w-4 h-4" />
            ))}
        </span>
        <span
          className={`text-sm flex items-center gap-3 ${
            isSelected ? "text-white" : "text-zinc-400"
          }`}
        >
          {data.name}
          {data.stale && (
            <span>
              {" "}
              <span className="rounded-md bg-orange-500/10 px-2 py-1 text-[10px] text-orange-500 ring-1 ring-inset ring-orange-500/40">
                Stale
              </span>
            </span>
          )}
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
  payload: types.StoreMountedPayload["store_mounted"],
  stale: boolean,
): ComponentData {
  return {
    id: payload.store.id,
    name: payload.store.name.replace("Store", ""),
    props: {}, // todo
    state: {}, // todo
    stateTimeline: [], // todo
    children: [],
    stale,
  };
}

type Action =
  | {
      type: "add";
      payload: types.StoreMountedPayload["store_mounted"];
    }
  | { type: "stale"; payload: { id: string } };

function storeReducer(state: ComponentData[], action: Action): ComponentData[] {
  switch (action.type) {
    case "add":
      return addComponent(state, action.payload);

    case "stale":
      return markComponentAsStale(state, action.payload.id);

    default:
      return state;
  }
}

function addComponent(
  state: ComponentData[],
  payload: types.StoreMountedPayload["store_mounted"],
): ComponentData[] {
  if (!payload.store.parent) {
    return state.some((item) => item.id === payload.store.id)
      ? state.map((item) =>
          item.id === payload.store.id ? { ...item, stale: false } : item,
        )
      : [...state, createChild(payload, false)];
  }

  return state.map((item) => {
    if (item.id === payload.store.parent!.id) {
      const existingChildIndex = item.children.findIndex(
        (child) => child.id === payload.store.id,
      );

      if (existingChildIndex !== -1) {
        // If child exists and is stale, remove it
        if (item.children[existingChildIndex].stale) {
          const newChildren = [...item.children];
          newChildren.splice(existingChildIndex, 1);
          return {
            ...item,
            children: [...newChildren, createChild(payload, false)],
          };
        }
        // If child exists and is not stale, don't modify
        return item;
      }

      // If child doesn't exist, add it
      return {
        ...item,
        children: [...item.children, createChild(payload, false)],
      };
    }

    return {
      ...item,
      children: addComponent(item.children, payload),
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
