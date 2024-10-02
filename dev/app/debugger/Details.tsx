import { ClockIcon } from "lucide-react";
import { ComponentData, StateChange } from "./types";
import ValueInspector from './ValueInspector'

function StateTimeline({ timeline }: { timeline: StateChange[] }) {
  return (
    <div className="mt-4">
      <h4 className="mb-2 text-sm font-medium text-zinc-400">State Timeline</h4>
      {timeline.length === 0 ? (
        <p className="text-sm text-zinc-500">No state changes recorded.</p>
      ) : (
        <ul className="space-y-2">
          {timeline.map((change, index) => (
            <li key={index} className="rounded bg-zinc-800 p-2 text-sm">
              <div className="mb-1 flex items-center text-zinc-400">
                <ClockIcon className="mr-1 h-4 w-4" />
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

export function ComponentDetails({ data }: { data?: ComponentData }) {
  if (!data) return null;

  return (
    <div className="h-full overflow-auto p-4">
      <h3 className="mb-2 flex items-center gap-3 text-lg font-semibold text-white">
        <span>{data.name}</span>
        {data.stale && (
          <span>
            {" "}
            <span className="rounded-md bg-orange-500/10 px-2 py-1 text-sm font-normal text-orange-500 ring-1 ring-inset ring-orange-500/40">
              Unmounted
            </span>
          </span>
        )}
      </h3>
      <div className="mb-4">
        <h4 className="mb-1 text-sm font-medium text-zinc-400">Props</h4>
        <pre className="rounded bg-zinc-800 p-2 text-sm text-white">
          <ValueInspector value={data.props} delimiter="." />
        </pre>
      </div>
      <div className="mb-4">
        <h4 className="mb-1 text-sm font-medium text-zinc-400">
          Current State
        </h4>
        <pre className="rounded bg-zinc-800 p-2 text-sm text-white">
          <ValueInspector value={data.state} delimiter="." />
        </pre>
      </div>
      <StateTimeline timeline={data.stateTimeline} />
    </div>
  );
}
