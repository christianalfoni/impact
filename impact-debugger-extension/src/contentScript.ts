console.log("Content script loaded.");

// Send a message to the background script
chrome.runtime.sendMessage({
  from: "content-script",
  message: "Hello from content script",
});

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
  if (request.from === "devtools-panel") {
    console.log("Message from DevTools panel:", request.message);
    sendResponse({ status: "Content script received your message." });
  }
});
