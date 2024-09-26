import * as types from "./types";
export * as types from "./types";

import { addDebugListener, StoreContainer } from "@impact-react/store";

const storeRefs = new Map<StoreContainer, string>();

let promiseResolver: (value: Window) => void;
const awaitBridge = new Promise<Window>((resolve) => {
  promiseResolver = resolve;
});

export function connectDebuggerBridge(target: Window) {
  target.postMessage(types.CONNECT_DEBUG_MESSAGE, "*");
  promiseResolver(target);
}

async function sendMessageToDebugger(event: types.DebugEvent) {
  // Barrier to ensure that the bridge is connected before sending messages
  const targetWindow = await awaitBridge;

  const message: types.DebugData = {
    source: types.DEBUG_SOURCE,
    event,
  };

  switch (event.type) {
    case "store_mounted": {
      const storeRefId = createUniqueId();

      if (!storeRefs.has(event.storeContext)) {
        storeRefs.set(event.storeContext, storeRefId);
      }

      const getParentStore = () => {
        const parent = event.storeContext.parent;
        if (parent == null) return;

        const parentId = storeRefs.get(parent);
        if (parentId == undefined) return;

        return {
          id: parentId,
          name: parent.name,
        };
      };

      message.event = {
        type: "store_mounted_debugger",
        store: {
          id: storeRefId,
          name: event.storeContext.name,
          parent: getParentStore(),
        },
      };

      break;
    }

    case "store_unmounted": {
      if (storeRefs.get(event.storeContext)) {
        message.event = {
          type: "store_unmounted_debugger",
          id: storeRefs.get(event.storeContext)!,
        };
      }

      break;
    }
  }

  try {
    targetWindow.postMessage(message, "*");
  } catch (e) {
    console.error(e);
  }
}

addDebugListener(sendMessageToDebugger);

function createUniqueId() {
  return Math.random().toString(36).substring(2, 15);
}
