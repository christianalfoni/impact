import { ClockIcon } from "lucide-react";
import { ComponentData, StateChange } from "./types";

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

export function ComponentDetails({ data }: { data: ComponentData | null }) {
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
