"use client";

import { useEffect, useState } from "react";
import {
  ChevronRightIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  SearchIcon,
  XIcon,
  ClockIcon,
} from "lucide-react";
import { DebugData } from "impact-react-debugger";

type StateChange = {
  timestamp: number;
  key: string;
  oldValue: any;
  newValue: any;
};

type ComponentData = {
  id: string;
  name: string;
  props: Record<string, any>;
  state: Record<string, any>;
  children: ComponentData[];
  stateTimeline: StateChange[];
};

const mockComponentTree: ComponentData = {
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

function StateTimeline({ timeline }: { timeline: StateChange[] }) {
  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium text-zinc-400 mb-2">State Timeline</h4>
      {timeline.length === 0 ? (
        <p className="text-sm text-zinc-500">No state changes recorded.</p>
      ) : (
        <ul className="space-y-2">
          {timeline.map((change, index) => (
            <li key={index} className="bg-zinc-800 p-2 rounded text-sm">
              <div className="flex items-center text-zinc-400 mb-1">
                <ClockIcon className="w-4 h-4 mr-1" />
                <span>{new Date(change.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className="text-white">
                <span className="font-medium">{change.key}</span> changed:
              </div>
              <div className="text-red-400 line-through">
                {JSON.stringify(change.oldValue)}
              </div>
              <div className="text-green-400">
                {JSON.stringify(change.newValue)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ComponentDetails({ data }: { data: ComponentData | null }) {
  if (!data) return null;

  return (
    <div className="p-4 overflow-auto h-full">
      <h3 className="text-lg font-semibold text-white mb-2">{data.name}</h3>
      <div className="mb-4">
        <h4 className="text-sm font-medium text-zinc-400 mb-1">Props</h4>
        <pre className="text-sm text-white bg-zinc-800 p-2 rounded">
          {JSON.stringify(data.props, null, 2)}
        </pre>
      </div>
      <div className="mb-4">
        <h4 className="text-sm font-medium text-zinc-400 mb-1">
          Current State
        </h4>
        <pre className="text-sm text-white bg-zinc-800 p-2 rounded">
          {JSON.stringify(data.state, null, 2)}
        </pre>
      </div>
      <StateTimeline timeline={data.stateTimeline} />
    </div>
  );
}

export default function ReactDevTool() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
    id: string | null,
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
        console.log(e.data.payload);
      }
    };

    window.addEventListener("message", bridge);
    return () => {
      window.removeEventListener("message", bridge);
    };
  }, []);

  return (
    <div className="bg-zinc-900 text-white h-screen flex font-mono">
      {isSidebarOpen && (
        <div className="w-1/2 border-r border-zinc-800 flex flex-col">
          <div className="px-4 py-4 border-b border-zinc-800 flex items-center">
            <svg
              className="w-8 h-8 mr-4"
              viewBox="0 0 64 77"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.74239 47.4469C1.00095 55.451 -1.24714 62.3506 1.52825 65.6401C3.66203 68.1691 8.39908 68.1303 14.4999 66.0175V66L16.4129 59.8782C15.7919 60.1553 15.1838 60.4123 14.5901 60.6488C11.3598 61.9356 8.82185 62.508 7.06393 62.5667C6.07086 62.5999 5.58192 62.471 5.37981 62.3904C5.33441 62.1776 5.28958 61.6739 5.48944 60.7006C5.84322 58.9777 6.83462 56.5723 8.64679 53.6046C9.64205 51.9748 10.839 50.2495 12.2211 48.4621C10.703 48.2518 8.43307 47.877 6.74239 47.4469ZM5.26084 62.3301C5.26084 62.3301 5.26641 62.333 5.27577 62.3406C5.26523 62.3342 5.26084 62.3301 5.26084 62.3301ZM5.41923 62.5178C5.41923 62.5178 5.41594 62.5128 5.41135 62.5013C5.41727 62.5118 5.41923 62.5178 5.41923 62.5178Z"
                fill="#0097C7"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M40.1817 62.7898C49.8264 68.4466 57.927 70.3202 61.0792 66.8865C64.1773 63.5119 61.7601 55.8126 55.5449 46.885C55.5298 46.9236 55.5148 46.962 55.4999 47L51.9771 50.5228C52.9215 51.9213 53.755 53.2735 54.4705 54.5637C56.1569 57.6046 57.0468 60.0494 57.3282 61.7856C57.4871 62.7664 57.4213 63.2678 57.367 63.4785C57.1617 63.5505 56.6678 63.6589 55.677 63.5842C53.9231 63.452 51.4113 62.7739 48.2376 61.353C46.8152 60.7162 45.3127 59.9542 43.7492 59.0736L40.1817 62.7898ZM57.4884 63.4232C57.4884 63.4232 57.4839 63.4271 57.4731 63.4331C57.4775 63.4298 57.481 63.4274 57.4835 63.4258C57.4866 63.4239 57.4884 63.4232 57.4884 63.4232ZM57.3309 63.588C57.3258 63.5993 57.3223 63.6042 57.3223 63.6042C57.3223 63.6042 57.3245 63.5983 57.3309 63.588Z"
                fill="#0097C7"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M58.2462 30.804C63.0252 23.6003 64.7347 17.5014 62.1766 14.4696C59.7886 11.6392 54.1401 12.025 46.9684 14.9348L44.9859 21.3229C46.4225 20.6053 47.8036 19.9831 49.1147 19.4608C52.3451 18.174 54.883 17.6016 56.6409 17.5429C57.634 17.5097 58.1229 17.6387 58.3251 17.7192C58.3704 17.932 58.4153 18.4357 58.2154 19.409C57.8616 21.1319 56.8702 23.5373 55.0581 26.505C54.5687 27.3064 54.0306 28.1308 53.4457 28.9743L53.4999 29C54.2981 29 56.3196 29.367 58.2462 30.804ZM58.2856 17.5918C58.2856 17.5918 58.2889 17.5968 58.2935 17.6082C58.2876 17.5978 58.2856 17.5918 58.2856 17.5918ZM58.4291 17.769C58.4396 17.7754 58.444 17.7795 58.444 17.7795C58.444 17.7795 58.4384 17.7766 58.4291 17.769Z"
                fill="#0097C7"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M21.0993 15.9606C12.5369 11.3829 5.50944 10.0812 2.62503 13.2232C-0.194297 16.2942 1.55392 22.9468 6.57552 30.8475L10.1718 27.1613C9.83966 26.6132 9.52683 26.0743 9.23377 25.5459C7.54735 22.505 6.65747 20.0603 6.37608 18.324C6.21713 17.3432 6.28299 16.8418 6.33725 16.6311C6.54256 16.5591 7.03647 16.4507 8.02728 16.5254C9.7812 16.6576 12.293 17.3357 15.4666 18.7566C16.1121 19.0456 16.7741 19.3604 17.4508 19.7003L21.0993 15.9606ZM6.38197 16.5055C6.38197 16.5055 6.37976 16.5114 6.37341 16.5216C6.37847 16.5103 6.38197 16.5055 6.38197 16.5055ZM6.21587 16.6864C6.21587 16.6864 6.22042 16.6825 6.23122 16.6765C6.22155 16.6837 6.21587 16.6864 6.21587 16.6864Z"
                fill="#0097C7"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M45.3153 0.642383C46.1629 1.31883 46.461 2.6036 46.0369 3.75292L35.9337 31.1379L55.6803 35.3733C56.5284 35.5552 57.1844 36.2796 57.3742 37.2442C57.5635 38.2088 57.2553 39.2484 56.5767 39.9293L20.7612 75.8844C19.9356 76.7132 18.7583 76.8201 17.9107 76.1436C17.063 75.4676 16.7651 74.1824 17.189 73.0335L27.2922 45.6483L7.54549 41.4128C6.69745 41.231 6.04181 40.5067 5.85203 39.542C5.66221 38.5773 5.9708 37.5378 6.64908 36.8569L42.4647 0.901977C43.2903 0.0731618 44.4677 -0.0340628 45.3153 0.642383ZM13.1419 37.1586L31.0537 41.0005C31.7119 41.1416 32.2644 41.6128 32.5644 42.2889C32.8643 42.9649 32.8814 43.7774 32.6111 44.5101L25.1939 64.6146L50.0839 39.6275L32.1722 35.7857C31.5141 35.6446 30.9616 35.1734 30.6616 34.4973C30.3616 33.8213 30.3446 33.0088 30.6149 32.2761L38.032 12.1717L13.1419 37.1586Z"
                fill="#F2F2F2"
              />
            </svg>

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