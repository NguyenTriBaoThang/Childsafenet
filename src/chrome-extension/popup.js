function setMsg(text, ok) {
  const el = document.getElementById("msg");
  el.textContent = text || "";
  el.className = ok ? "ok" : "bad";
}

function setStatus(enabled, hasToken) {
  const s = document.getElementById("statusLine");
  s.innerHTML = `
    Status: <b>${enabled ? "ON" : "OFF"}</b><br/>
    Paired token: <b>${hasToken ? "YES" : "NO"}</b>
  `;
}

async function refresh() {
  chrome.runtime.sendMessage({ type: "CSN_GET_STATE" }, (resp) => {
    if (!resp?.ok) {
      setMsg(resp?.message || "Cannot get state", false);
      return;
    }
    setStatus(!!resp.enabled, !!resp.hasToken);
  });
}

document.getElementById("btnOn").addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "CSN_TOGGLE", enabled: true }, (resp) => {
    if (!resp?.ok) return setMsg(resp?.message || "Toggle ON failed", false);
    setMsg("Enabled", true);
    refresh();
  });
});

document.getElementById("btnOff").addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "CSN_TOGGLE", enabled: false }, (resp) => {
    if (!resp?.ok) return setMsg(resp?.message || "Toggle OFF failed", false);
    setMsg("Disabled", true);
    refresh();
  });
});

document.getElementById("btnOpenWeb").addEventListener("click", () => {
  chrome.tabs.create({ url: "http://localhost:5173/dashboard" });
});

refresh();