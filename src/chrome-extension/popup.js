const statusEl = document.getElementById("status");
const tokenEl = document.getElementById("token");

function setStatus(html) {
  statusEl.innerHTML = html || "";
}

async function loadToken() {
  const { csn_token } = await chrome.storage.local.get("csn_token");
  tokenEl.value = csn_token || "";
}

async function saveToken() {
  const t = tokenEl.value.trim();
  if (!t) return setStatus(`<div class="bad">Token rỗng.</div>`);
  await chrome.storage.local.set({ csn_token: t });
  setStatus(`<div class="ok">Saved token ✅</div>`);
}

async function clearToken() {
  await chrome.storage.local.remove("csn_token");
  tokenEl.value = "";
  setStatus(`<div class="ok">Cleared ✅</div>`);
}

async function scanCurrentTab() {
  setStatus(`<div class="muted">Scanning...</div>`);
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !tab.url) return setStatus(`<div class="bad">No active tab.</div>`);

  // gửi message cho background làm scan
  const res = await chrome.runtime.sendMessage({ type: "CSN_SCAN_TAB", tabId: tab.id });
  if (!res?.ok) {
    setStatus(`<div class="bad">${res?.error || "Scan failed"}</div>`);
    return;
  }

  const r = res.result;
  setStatus(`
    <div><b>Action:</b> <span class="${r.action === "BLOCK" ? "bad" : "ok"}">${r.action}</span></div>
    <div><b>Label:</b> ${r.label} | <b>Score:</b> ${r.score}</div>
    <div class="muted" style="margin-top:6px;">${(r.explanation || []).slice(0,2).join("<br/>")}</div>
  `);
}

document.getElementById("save").addEventListener("click", saveToken);
document.getElementById("clear").addEventListener("click", clearToken);
document.getElementById("test").addEventListener("click", scanCurrentTab);

loadToken();