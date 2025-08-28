// Content script for MyLinks extension
// This script runs on web pages and handles context menu interactions

console.log("MyLinks Extension: Content script loaded");

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

document.addEventListener("contextmenu", (event) => {
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

document.addEventListener("visibilitychange", () => {
  const isVisible = document.visibilityState === "visible";
  if (isVisible) {
    chrome.runtime.sendMessage({ type: "PAGE_VISIBILITY", visible: true });
  }
});
