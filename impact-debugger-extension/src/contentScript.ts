console.log("Content script loaded.");

window.addEventListener(
  "message",
  function (event) {
    if (event.source !== window) return;

    if (event.data.type && event.data.type === "IMPACT_DEBUG_MESSAGE") {
      chrome.runtime.sendMessage(event.data.message);
    }
  },
  false,
);

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
  if (request.from === "devtools-panel") {
    console.log("Message from DevTools panel:", request.message);
    sendResponse({ status: "Content script received your message." });
  }
});
