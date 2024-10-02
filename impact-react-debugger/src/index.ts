import { DebuggerProtocolReceiver } from "./debugger-protocol";
import * as types from "./types";
export * as types from "./types";
export { DebuggerProtocolSender } from "./debugger-protocol";

import { addDebugListener, StoreContainer } from "@impact-react/store";

declare global {
  interface Window {
    __REACT_DEVTOOLS_GLOBAL_HOOK__: any;
  }
}

const storeRefs = new Map<StoreContainer, string>();

let promiseResolver: (value: Window) => void;
const awaitBridge = new Promise<Window>((resolve) => {
  promiseResolver = resolve;
});

export function connectDebuggerBridge(target: Window) {
  target.postMessage(types.CONNECT_DEBUG_MESSAGE, "*");
  promiseResolver(target);
}

const receiver = new DebuggerProtocolReceiver();
receiver.on("highlight-element", (data) => {
  window.postMessage({
    source: "react-devtools-content-script",
    payload: {
      event: "highlightNativeElement",
      payload: {
        displayName: data.componentDisplayName,
        hideAfterTimeout: false,
        id: data.reactFiberId,
        openNativeElementsPanel: false,
        rendererID: 1,
        scrollIntoView: false,
      },
    },
  });
});

receiver.on("highlight-clean", () => {
  window.postMessage({
    source: "react-devtools-content-script",
    payload: {
      event: "clearNativeElementHighlight",
    },
  });
});

async function sendMessageToDebugger(event: types.DebugEvent) {
  // Barrier to ensure that the bridge is connected before sending messages
  const targetWindow = await awaitBridge;

  const message: types.DebugData = {
    source: types.DEBUG_SOURCE,
    event,
  };

  if ("storeContext" in event && !storeRefs.has(event.storeContext)) {
    const storeRefId = createUniqueId();
    storeRefs.set(event.storeContext, storeRefId);
  }

  // console.log(event);

  switch (event.type) {
    case "store_mounted": {
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

      const node = findStateNode(event.componentRef);
      const reactFiberId =
        window.__REACT_DEVTOOLS_GLOBAL_HOOK__?.rendererInterfaces
          ?.get(1)
          ?.getFiberIDForNative(node);

      message.event = {
        type: "store_mounted_debugger",
        reactFiberId,
        store: {
          id: storeRefs.get(event.storeContext)!,
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
          storeRefId: storeRefs.get(event.storeContext)!,
        };
      }

      break;
    }

    case "props": {
      const propsClone = { ...event.props };

      delete propsClone.children;

      message.event = {
        type: "props_debugger",
        props: propsClone,
        storeRefId: storeRefs.get(event.storeContext)!,
      };

      break;
    }

    case "state": {
      message.event = {
        type: "state_debugger",
        state: event.state,
        storeRefId: storeRefs.get(event.storeContext)!,
      };

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

function findStateNode(componentRef: any): HTMLElement | null {
  if (componentRef.stateNode) {
    return componentRef.stateNode;
  }

  return findStateNode(componentRef.return);
}
