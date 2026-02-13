// content.js
// Bridge between Web (window.postMessage) <-> Extension (chrome.runtime.sendMessage)
// MV3-safe: handles runtime.lastError to avoid "Unchecked runtime.lastError"

(() => {
  const EXT_SOURCE = "ChildSafeNetExt";
  const WEB_SOURCE = "ChildSafeNetWeb";

  // ✅ Chỉ nhận message từ chính window (tránh iframe/other windows)
  // ✅ Có thể siết origin nếu bạn muốn
  const ALLOWED_ORIGINS = new Set([
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    // add domain production nếu có:
    // "https://your-domain.com",
  ]);

  function isAllowedOrigin(origin) {
    // Nếu bạn không muốn chặn origin, return true
    return ALLOWED_ORIGINS.has(origin);
  }

  function postToWeb(payload) {
    // Luôn gắn source để web lọc đúng message từ extension
    window.postMessage({ source: EXT_SOURCE, ...payload }, "*");
  }

  /**
   * sendMessage an toàn:
   * - bắt chrome.runtime.lastError
   * - retry 1 lần nếu worker đang ngủ/reload
   */
  function safeSendMessage(message, opts = {}) {
    const timeoutMs = typeof opts.timeoutMs === "number" ? opts.timeoutMs : 3500;
    const retries = typeof opts.retries === "number" ? opts.retries : 1;

    return new Promise((resolve) => {
      let done = false;

      const timer = setTimeout(() => {
        if (done) return;
        done = true;
        resolve({ ok: false, error: "TIMEOUT" });
      }, timeoutMs);

      function finish(result) {
        if (done) return;
        done = true;
        clearTimeout(timer);
        resolve(result);
      }

      function attempt(tryIndex) {
        try {
          chrome.runtime.sendMessage(message, (resp) => {
            const err = chrome.runtime.lastError;
            if (err) {
              // retry nếu còn lượt
              if (tryIndex < retries) {
                setTimeout(() => attempt(tryIndex + 1), 120);
                return;
              }
              finish({ ok: false, error: err.message || String(err) });
              return;
            }

            // background có thể trả null/undefined => vẫn wrap lại
            if (resp && typeof resp === "object") finish(resp);
            else finish({ ok: true, data: resp });
          });
        } catch (e) {
          if (tryIndex < retries) {
            setTimeout(() => attempt(tryIndex + 1), 120);
            return;
          }
          finish({ ok: false, error: String(e) });
        }
      }

      attempt(0);
    });
  }

  // ============ Handle messages from Web ============
  window.addEventListener("message", async (event) => {
    // Chỉ nhận từ chính window
    if (event.source !== window) return;

    // Siết origin cho an toàn
    if (!isAllowedOrigin(event.origin)) return;

    const data = event.data;
    if (!data || typeof data !== "object") return;

    // Chỉ nhận message mà web gắn source (khuyến nghị web làm vậy)
    // Nếu hiện tại web bạn chưa gắn WEB_SOURCE, bạn có thể bỏ check này.
    if (data.source && data.source !== WEB_SOURCE) return;

    const type = data.type;

    // --- PING ---
    if (type === "CSN_PING") {
      const resp = await safeSendMessage({ type: "CSN_PING" }, { timeoutMs: 3500, retries: 1 });

      if (!resp?.ok) {
        postToWeb({
          type: "CSN_EXT_HELLO",
          ok: false,
          message: resp?.error || "PING failed",
        });
        return;
      }

      postToWeb({
        type: "CSN_EXT_HELLO",
        ok: true,
        // background có thể trả version/enabled/paired...
        ...resp,
      });
      return;
    }

    // --- PAIR ---
    if (type === "CSN_PAIR") {
      const token = (data.token || "").trim();

      // token rỗng vẫn gửi, nhưng thường web nên có token
      const resp = await safeSendMessage(
        { type: "CSN_PAIR", token },
        { timeoutMs: 4500, retries: 1 }
      );

      if (!resp?.ok) {
        postToWeb({
          type: "CSN_PAIR_RESULT",
          ok: false,
          message: resp?.error || "Pair failed",
        });
        return;
      }

      postToWeb({
        type: "CSN_PAIR_RESULT",
        ok: true,
        enabled: resp?.enabled,
        message: resp?.message || "Paired",
      });
      return;
    }

    // --- TOGGLE ---
    if (type === "CSN_TOGGLE") {
      const enabled = !!data.enabled;

      const resp = await safeSendMessage(
        { type: "CSN_TOGGLE", enabled },
        { timeoutMs: 3500, retries: 1 }
      );

      if (!resp?.ok) {
        postToWeb({
          type: "CSN_TOGGLE_RESULT",
          ok: false,
          message: resp?.error || "Toggle failed",
        });
        return;
      }

      postToWeb({
        type: "CSN_TOGGLE_RESULT",
        ok: true,
        enabled: resp?.enabled ?? enabled,
        message: resp?.message || "Toggled",
      });
      return;
    }
  });

  // ============ Optional: auto ping when injected ============
  // Giúp web detect extension sớm, nhưng không bắt buộc.
  (async () => {
    const resp = await safeSendMessage({ type: "CSN_PING" }, { timeoutMs: 3000, retries: 1 });
    if (resp?.ok) {
      postToWeb({
        type: "CSN_EXT_HELLO",
        ok: true,
        ...resp,
      });
    } else {
      // Không spam lỗi, web sẽ tự ping lại
      // postToWeb({ type: "CSN_EXT_HELLO", ok: false, message: resp?.error || "PING failed" });
    }
  })();
})();