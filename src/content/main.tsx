// Content script for MyLinks extension
// This script runs on web pages and handles context menu interactions

console.log("MyLinks Extension: Content script loaded");

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log("Content script received message:", message);

  switch (message.type) {
    case "GET_PAGE_INFO":
      const pageInfo = {
        url: window.location.href,
        title: document.title,
        selectionText: window.getSelection()?.toString() || "",
      };
      sendResponse({ success: true, data: pageInfo });
      break;

    default:
      sendResponse({ success: false, error: "Unknown message type" });
  }

  return true; // Keep message channel open for async response
});

// Add custom context menu functionality if needed
document.addEventListener("contextmenu", (event) => {
  // Store the clicked element info for potential use
  const target = event.target as HTMLElement;
  if (target.tagName === "A") {
    const link = target as HTMLAnchorElement;
    chrome.storage.local.set({
      contextMenuInfo: {
        url: link.href,
        title: link.textContent?.trim() || link.href,
        selectionText: window.getSelection()?.toString() || "",
      },
    });
  }
});

// Listen for selection changes to update context menu info
document.addEventListener("selectionchange", () => {
  const selection = window.getSelection();
  if (selection && selection.toString().trim()) {
    chrome.storage.local.set({
      contextMenuInfo: {
        url: window.location.href,
        title: document.title,
        selectionText: selection.toString().trim(),
      },
    });
  }
});
