chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(["gemini_api_key"], (result) => {
    if (!result.gemini_api_key) {
      chrome.tabs.create({ url: "options.html" });
    }
  });
});
