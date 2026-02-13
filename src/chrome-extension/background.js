const API_BASE = "https://localhost:7047";

async function getState() {
  const st = await chrome.storage.local.get(["csn_token", "csn_enabled"]);
  return {
    token: st.csn_token || null,
    enabled: typeof st.csn_enabled === "boolean" ? st.csn_enabled : true,
  };
}

async function setToken(token) {
  await chrome.storage.local.set({ csn_token: token });
}

async function setEnabled(enabled) {
  await chrome.storage.local.set({ csn_enabled: !!enabled });
}

async function scanWithApi(url) {
  const { token } = await getState();
  if (!token) {
    return {
      riskLevel: "LOW",
      label: "benign",
      score: 0,
      action: "ALLOW",
      explanation: ["No token paired yet"],
      meta: { reason: "no_token" },
    };
  }

  const payload = {
    url,
    title: "",
    text: "",
    source: "Extension",
  };

  const res = await fetch(`${API_BASE}/api/scan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    return {
      riskLevel: "MEDIUM",
      label: "api_error",
      score: 0,
      action: "WARN",
      explanation: ["API error when scanning", `${res.status} ${t}`],
      meta: { status: res.status },
    };
  }

  return await res.json();
}

// MV3: phải dùng onMessage và trả true nếu async
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    try {
      // Ping from web via content-script
      if (msg?.type === "CSN_PING") {
        const st = await getState();
        sendResponse({ ok: true, enabled: st.enabled, hasToken: !!st.token });
        return;
      }

      // Pair token from web
      if (msg?.type === "CSN_PAIR") {
        const token = msg?.token || "";
        if (!token) {
          sendResponse({ ok: false, message: "Missing token" });
          return;
        }
        await setToken(token);
        const st = await getState();
        sendResponse({ ok: true, enabled: st.enabled, hasToken: true });
        return;
      }

      // Toggle enabled
      if (msg?.type === "CSN_TOGGLE") {
        await setEnabled(!!msg.enabled);
        const st = await getState();
        sendResponse({ ok: true, enabled: st.enabled });
        return;
      }

      // Get state (popup)
      if (msg?.type === "CSN_GET_STATE") {
        const st = await getState();
        sendResponse({ ok: true, enabled: st.enabled, hasToken: !!st.token });
        return;
      }

      // Scan from content script
      if (msg?.type === "CSN_SCAN") {
        const st = await getState();

        // nếu tắt => allow
        if (!st.enabled) {
          sendResponse({
            ok: true,
            result: {
              riskLevel: "LOW",
              label: "disabled",
              score: 0,
              action: "ALLOW",
              explanation: ["Extension disabled"],
              meta: { reason: "disabled" },
            },
          });
          return;
        }

        const url = msg?.url || "";
        const result = await scanWithApi(url);
        sendResponse({ ok: true, result });
        return;
      }

      sendResponse({ ok: false, message: "Unknown message" });
    } catch (e) {
      sendResponse({ ok: false, message: String(e?.message || e) });
    }
  })();

  return true; // ✅ cực quan trọng để tránh “message port closed…”
});