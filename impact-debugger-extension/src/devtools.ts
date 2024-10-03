// src/devtools.js
chrome.devtools.panels.create(
  "Impact Stores",
  "", // Optional icon path
  "panel.html", // HTML file for the panel's UI
  function (panel) {
    // Called when the panel is created
    panel.onShown.addListener((window) => {
      // Pass the tab ID to the panel
      // @ts-ignore
      window.tabId = chrome.devtools.inspectedWindow.tabId;
    });
  },
);
