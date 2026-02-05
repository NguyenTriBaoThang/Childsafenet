const API = "https://localhost:7047/api/scan";

async function getToken() {
  const { csn_token } = await chrome.storage.local.get("csn_token");
  return csn_token || "";
}

async function scanTab(tabId) {
  const token = await getToken();
  if (!token) throw new Error("Missing token. Open extension popup and Save JWT token first.");

  const tab = await chrome.tabs.get(tabId);
  const tabUrl = tab.url || "";
  if (!tabUrl) throw new Error("Tab URL is empty.");

  let page = null;
  try {
    page = await chrome.tabs.sendMessage(tabId, { type: "CSN_GET_PAGE_TEXT" });
  } catch (e) {
    throw new Error("Cannot read page content (blocked page or no permission).");
  }

  const payload = {
    url: page?.url || tabUrl,
    title: page?.title || "",
    text: page?.text || "",
    source: "Extension"
  };

  const res = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const raw = await res.text();
    throw new Error(`API ${res.status}: ${raw}`);
  }

  return await res.json();
}

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete" || !tab?.url) return;

  if (tab.url.startsWith("chrome://") || tab.url.startsWith("edge://") || tab.url.startsWith("about:")) return;

  try {
    const result = await scanTab(tabId);

    if (result?.action === "BLOCK") {
      const blockedUrl = chrome.runtime.getURL("block.html") + "?u=" + encodeURIComponent(tab.url);
      chrome.tabs.update(tabId, { url: blockedUrl });
    }
  } catch (e) {
    console.log("ChildSafeNet scan error:", e?.message || e);
  }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type === "CSN_SCAN_TAB") {
    scanTab(msg.tabId)
      .then((result) => sendResponse({ ok: true, result }))
      .catch((err) => sendResponse({ ok: false, error: err?.message || String(err) }));
    return true; 
  }
});