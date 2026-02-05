function extractText(maxLen = 2000) {
  try {
    // Lấy text thô từ body (giới hạn)
    let t = document.body ? (document.body.innerText || "") : "";
    t = t.replace(/\s+/g, " ").trim();
    if (t.length > maxLen) t = t.slice(0, maxLen);
    return t;
  } catch {
    return "";
  }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type === "CSN_GET_PAGE_TEXT") {
    sendResponse({
      url: location.href,
      title: document.title || "",
      text: extractText(2000)
    });
    return true;
  }
});