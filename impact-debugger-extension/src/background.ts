// src/background.js

import { BackgroundScriptMessage } from "./types";

// Connections to DevTools panels
const connections: Record<string, chrome.runtime.Port> = {};

// This is where the panel connects with the current inspected tab, so it can
// show different tabs (needs implementation in panel code)
chrome.runtime.onConnect.addListener((port) => {
  const extensionListener = (
    message: BackgroundScriptMessage & { tabId: number },
  ) => {
    if (message.type === "ready") {
      connections[message.tabId] = port;
    }

    const { tabId, ...actualMessage } = message;

    chrome.tabs.sendMessage(tabId, {
      source: "IMPACT_DEBUGGER",
      message: actualMessage,
    });
  };

  port.onMessage.addListener(extensionListener);

  port.onDisconnect.addListener((port) => {
    port.onMessage.removeListener(extensionListener);

    const tabs = Object.keys(connections);
    for (let i = 0, len = tabs.length; i < len; i++) {
      if (connections[tabs[i]] === port) {
        delete connections[tabs[i]];
        break;
      }
    }
  });
});

// Relay messages from content scripts to DevTools panel
chrome.runtime.onMessage.addListener((request, sender) => {
  // Messages from content scripts have sender.tab set
  if (sender.tab) {
    const tabId = sender.tab.id;
    if (tabId && tabId in connections) {
      connections[tabId].postMessage(request);
    } else {
      console.log("Tab not found in connection list.");
    }
  } else {
    console.log("sender.tab not defined.");
  }
  return true;
});
