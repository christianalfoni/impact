"use client";

import { useEffect, useState } from "react";
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  SearchIcon,
  XIcon,
  ChevronDownIcon,
} from "lucide-react";
import { DebugData } from "impact-react-debugger";
import { Logo, LogoMuted } from "./Logo";
import { ComponentData } from "./types";
import { ComponentDetails } from "./Details";
import { set } from "mobx";

export const mockComponentTree: ComponentData = {
  id: "1",
  name: "App",
  props: { title: "My App" },
  state: { count: 2 },
  stateTimeline: [
    { timestamp: Date.now() - 3000, key: "count", oldValue: 0, newValue: 1 },
    { timestamp: Date.now() - 1000, key: "count", oldValue: 1, newValue: 2 },
  ],
  children: [
    {
      id: "2",
      name: "Header",
      props: { title: "Welcome" },
      state: {},
      stateTimeline: [],
      children: [],
    },
    {
      id: "3",
      name: "Content",
      props: {},
      state: { items: ["Item 1", "Item 2", "Item 3"] },
      stateTimeline: [
        {
          timestamp: Date.now() - 2000,
          key: "items",
          oldValue: ["Item 1", "Item 2"],
          newValue: ["Item 1", "Item 2", "Item 3"],
        },
      ],
      children: [
        {
          id: "4",
          name: "List",
          props: { items: ["Item 1", "Item 2", "Item 3"] },
          state: {},
          stateTimeline: [],
          children: [],
        },
      ],
    },
  ],
};

export default function ReactDevTool() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

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

  const filteredTree = searchTerm
    ? filterTree(mockComponentTree)
    : mockComponentTree;

  const selectedComponent = findComponentById(mockComponentTree, selectedId);

  function findComponentById(
    node: ComponentData,
    id: string | null
  ): ComponentData | null {
    if (node.id === id) return node;
    for (const child of node.children) {
      const found = findComponentById(child, id);
      if (found) return found;
    }
    return null;
  }

  useEffect(() => {
    const bridge = (e: MessageEvent<DebugData>) => {
      if (e.data.source === "impact-react-debugger") {
        const payload = e.data.payload;

        switch (payload.event) {
          case "connected": {
            setIsLoading(false);

            break;
          }

          default:
            break;
        }
      }
    };

    window.addEventListener("message", bridge);
    return () => {
      window.removeEventListener("message", bridge);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="bg-zinc-900 text-zinc-600 text-white h-screen flex font-mono flex">
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
            {filteredTree && (
              <TreeNode
                data={filteredTree}
                selectedId={selectedId}
                onSelect={setSelectedId}
              />
            )}
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
          className={`text-sm ${isSelected ? "text-white" : "text-zinc-400"}`}
        >
          {data.name}
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
