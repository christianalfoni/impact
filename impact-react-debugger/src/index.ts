import * as types from "./types";
export * as types from "./types";

import { addDebugListener } from "@impact-react/store";

let promiseResolver: (value: Window) => void;
const awaitBridge = new Promise<Window>((resolve) => {
  promiseResolver = resolve;
});

export function connectDebuggerBridge(target: Window) {
  target.postMessage(types.CONNECT_DEBUG_MESSAGE, "*");
  promiseResolver(target);
}

async function sendMessageToDebugger(event: types.DebugEvent) {
  const targetWindow = await awaitBridge;

  const message: types.DebugData = {
    source: types.DEBUG_SOURCE,
    event,
  };

  targetWindow.postMessage(message, "*");
}

addDebugListener(sendMessageToDebugger);
