// src/extension/pair.ts
// Web <-> Extension bridge via window.postMessage
// - Web sends: { source:"ChildSafeNetWeb", type:"CSN_*", ... }
// - Extension replies: { source:"ChildSafeNetExt", type:"CSN_*_RESULT" or "CSN_EXT_HELLO", ... }

export type ExtInbound =
  | { source: "ChildSafeNetExt"; type: "CSN_EXT_HELLO"; enabled?: boolean; version?: string }
  | { source: "ChildSafeNetExt"; type: "CSN_PAIR_RESULT"; ok: boolean; message?: string }
  | { source: "ChildSafeNetExt"; type: "CSN_TOGGLE_RESULT"; ok: boolean; enabled?: boolean; message?: string }
  | { source: "ChildSafeNetExt"; type: "CSN_PONG"; ok: boolean; enabled?: boolean; message?: string }
  | { source: "ChildSafeNetExt"; type: "CSN_ERROR"; message?: string };

type Unsubscribe = () => void;

function postToExt(payload: Record<string, any>) {
  window.postMessage({ source: "ChildSafeNetWeb", ...payload }, "*");
}

export function listenExtEvents(cb: (data: ExtInbound) => void): Unsubscribe {
  const handler = (event: MessageEvent) => {
    if (event.source !== window) return;
    const data = event.data as ExtInbound;
    if (!data || (data as any).source !== "ChildSafeNetExt") return;
    cb(data);
  };
  window.addEventListener("message", handler);
  return () => window.removeEventListener("message", handler);
}

// ---- Promise helpers with timeout ----
function waitForOnce<T extends ExtInbound["type"]>(
  type: T,
  timeoutMs = 1200
): Promise<Extract<ExtInbound, { type: T }>> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      un();
      reject(new Error("timeout"));
    }, timeoutMs);

    const un = listenExtEvents((data) => {
      if (data.type === type) {
        window.clearTimeout(timer);
        un();
        resolve(data as any);
      }
    });
  });
}

// ---- Public APIs ----

/** Ping to check extension/content-script ready (expects CSN_PONG or CSN_EXT_HELLO) */
export async function pingExtension(timeoutMs = 1200): Promise<{ ok: boolean; enabled?: boolean; message?: string }> {
  postToExt({ type: "CSN_PING" });

  try {
    // extension may respond by CSN_PONG or CSN_EXT_HELLO
    const res = await Promise.race([
      waitForOnce("CSN_PONG", timeoutMs),
      waitForOnce("CSN_EXT_HELLO", timeoutMs),
    ]);

    if (res.type === "CSN_EXT_HELLO") {
      return { ok: true, enabled: !!res.enabled, message: "hello" };
    }
    return { ok: !!res.ok, enabled: res.enabled, message: res.message };
  } catch {
    return { ok: false, message: "not_ready" };
  }
}

/** Pair token from web -> extension storage (expects CSN_PAIR_RESULT) */
export async function pairExtension(token: string, timeoutMs = 1200): Promise<{ ok: boolean; message?: string }> {
  postToExt({ type: "CSN_PAIR", token });

  try {
    const res = await waitForOnce("CSN_PAIR_RESULT", timeoutMs);
    return { ok: !!res.ok, message: res.message };
  } catch {
    return { ok: false, message: "timeout" };
  }
}

/** Toggle extension ON/OFF (expects CSN_TOGGLE_RESULT) */
export async function toggleExtension(
  enabled: boolean,
  timeoutMs = 1200
): Promise<{ ok: boolean; enabled?: boolean; message?: string }> {
  postToExt({ type: "CSN_TOGGLE", enabled });

  try {
    const res = await waitForOnce("CSN_TOGGLE_RESULT", timeoutMs);
    return { ok: !!res.ok, enabled: !!res.enabled, message: res.message };
  } catch {
    return { ok: false, enabled, message: "timeout" };
  }
}