// src/pages/Dashboard.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { getLogsApi } from "../api/client";
import { pairExtension, toggleExtension, listenExtEvents, pingExtension } from "../extension/pair";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Pill } from "../components/Pill";

type LogItem = {
  id: string;
  url: string;
  title?: string;
  label: string;
  riskLevel: string;
  score: number;
  action: "ALLOW" | "WARN" | "BLOCK";
  source?: string;
  createdAt: string;
};

function fmtDate(s: string) {
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleString();
}

export default function Dashboard() {
  const { role } = useAuth();

  // Extension UI state
  const [extMsg, setExtMsg] = useState<string | null>(null);
  const [extReady, setExtReady] = useState(false);
  const [extEnabled, setExtEnabled] = useState<boolean | null>(null);
  const [busy, setBusy] = useState<"pair" | "toggle_on" | "toggle_off" | "ping" | null>(null);

  // Quick test URL
  const [testUrl, setTestUrl] = useState("https://www.google.com");

  // Logs
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const stats = useMemo(() => {
    const total = logs.length;
    const allow = logs.filter((x) => x.action === "ALLOW").length;
    const warn = logs.filter((x) => x.action === "WARN").length;
    const block = logs.filter((x) => x.action === "BLOCK").length;
    return { total, allow, warn, block };
  }, [logs]);

  // Listen events from extension (optional realtime updates)
  useEffect(() => {
    const un = listenExtEvents((data: any) => {
      if (data?.type === "CSN_EXT_HELLO") {
        setExtReady(true);
        if (typeof data.enabled === "boolean") setExtEnabled(!!data.enabled);
      }
      if (data?.type === "CSN_TOGGLE_RESULT" && data.ok) {
        setExtEnabled(!!data.enabled);
      }
      // Pair result handled by promise already, but we can still reflect
      if (data?.type === "CSN_PAIR_RESULT" && data.ok) {
        setExtMsg("✅ Đã kết nối Extension!");
      }
    });
    return un;
  }, []);

  // On mount: ping to detect extension (timeout 1.2s)
  useEffect(() => {
    const run = async () => {
      setBusy("ping");
      const res = await pingExtension(1200);
      setBusy(null);

      if (res.ok) {
        setExtReady(true);
        if (typeof res.enabled === "boolean") setExtEnabled(res.enabled);
        setExtMsg("✅ Extension sẵn sàng");
      } else {
        setExtReady(false);
        setExtEnabled(null);
        setExtMsg("ℹ️ Chưa thấy Extension. Hãy Load unpacked + đảm bảo content-script chạy được trên trang.");
      }
    };
    run();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await getLogsApi(1, 10);
      setLogs((res.items as any) || []);
    } catch (e: any) {
      setErr("Không load được logs: " + (e?.response?.data?.message || e?.message || String(e)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Actions ----
  const doPair = async () => {
    const token = localStorage.getItem("csn_token") || "";
    if (!token) {
      setExtMsg("❌ Chưa có token. Hãy đăng nhập trước.");
      return;
    }

    setBusy("pair");
    setExtMsg("Đang kết nối Extension...");

    const res = await pairExtension(token, 1200);
    setBusy(null);

    if (!res.ok) {
      // timeout is the most common reason
      if (res.message === "timeout") {
        setExtReady(false);
        setExtMsg("❌ Pair timeout (1.2s). Có thể bạn chưa Load extension hoặc content-script chưa chạy trên trang này.");
      } else {
        setExtMsg("❌ Pair thất bại: " + (res.message || "Pair failed"));
      }
      return;
    }

    setExtReady(true);
    setExtMsg("✅ Đã kết nối Extension!");
  };

  const doToggle = async (enabled: boolean) => {
    setBusy(enabled ? "toggle_on" : "toggle_off");
    setExtMsg(`Đang ${enabled ? "bật" : "tắt"} Extension...`);

    const res = await toggleExtension(enabled, 1200);
    setBusy(null);

    if (!res.ok) {
      if (res.message === "timeout") {
        setExtReady(false);
        setExtMsg("❌ Toggle timeout (1.2s). Có thể extension chưa sẵn sàng / content-script chưa chạy.");
      } else {
        setExtMsg("❌ Toggle thất bại: " + (res.message || "Toggle failed"));
      }
      return;
    }

    setExtReady(true);
    setExtEnabled(!!res.enabled);
    setExtMsg(`✅ Extension ${res.enabled ? "BẬT" : "TẮT"} thành công`);
  };

  const openTestUrl = () => {
    if (!testUrl.trim()) return;
    window.open(testUrl.trim(), "_blank");
  };

  return (
    <div className="page">
      <div className="pageHeader">
        <div>
          <h1>Dashboard</h1>
          <p className="muted">
            Role: <b>{role || "parent"}</b> • Pair Extension + xem log quét gần đây
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Button variant="ghost" onClick={loadLogs} disabled={loading}>
            Refresh Logs
          </Button>
        </div>
      </div>

      {/* Extension */}
      <Card style={{ marginTop: 16 }}>
        <h3>Chrome Extension</h3>
        <p className="muted">
          (C2) Pair token từ web sang Extension. Sau khi Pair, Extension sẽ scan và block theo API.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12, alignItems: "center" }}>
          <Button onClick={doPair} disabled={busy !== null}>
            {busy === "pair" ? "Đang kết nối..." : "Kết nối Extension"}
          </Button>

          <Button variant="ghost" onClick={() => doToggle(true)} disabled={busy !== null}>
            {busy === "toggle_on" ? "Đang bật..." : "Bật Extension"}
          </Button>

          <Button variant="ghost" onClick={() => doToggle(false)} disabled={busy !== null}>
            {busy === "toggle_off" ? "Đang tắt..." : "Tắt Extension"}
          </Button>

          <div style={{ marginLeft: "auto" }}>
            <Pill kind={extReady ? "ok" : "warn"}>
              {extReady ? `READY${extEnabled === null ? "" : extEnabled ? " • ON" : " • OFF"}` : "NOT READY"}
            </Pill>
          </div>
        </div>

        {extMsg && (
          <div className="alert" style={{ marginTop: 12 }}>
            {extMsg}
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap", alignItems: "center" }}>
          <Input
            value={testUrl}
            onChange={(e: any) => setTestUrl(e.target.value)}
            placeholder="Nhập URL để mở test (Extension sẽ tự scan)"
            style={{ flex: 1, minWidth: 260 }}
          />
          <Button variant="ghost" onClick={openTestUrl}>
            Open URL
          </Button>
        </div>

        {!extReady && (
          <div className="muted" style={{ marginTop: 10, fontSize: 13 }}>
            Nếu luôn NOT READY: hãy kiểm tra bạn đã <b>Load unpacked extension</b>, và{" "}
            <b>content-script phải được inject vào trang đang mở</b> (localhost:5173).
            <br />
            Gợi ý: trong manifest cần host_permissions phù hợp và content_scripts match đúng.
          </div>
        )}
      </Card>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12, marginTop: 16 }}>
        <Card>
          <div className="muted">Total (latest 10)</div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>{stats.total}</div>
        </Card>
        <Card>
          <div className="muted">ALLOW</div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>{stats.allow}</div>
        </Card>
        <Card>
          <div className="muted">WARN</div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>{stats.warn}</div>
        </Card>
        <Card>
          <div className="muted">BLOCK</div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>{stats.block}</div>
        </Card>
      </div>

      {/* Logs */}
      <Card style={{ marginTop: 16 }}>
        <h3>Scan Logs (latest)</h3>

        {err && <div className="alert">{err}</div>}

        <div style={{ overflowX: "auto", marginTop: 10 }}>
          <table className="table">
            <thead>
              <tr>
                <th>URL</th>
                <th>Action</th>
                <th>Risk</th>
                <th>Label</th>
                <th>Score</th>
                <th>Source</th>
                <th>Time</th>
              </tr>
            </thead>

            <tbody>
              {logs.map((x) => (
                <tr key={x.id}>
                  <td style={{ maxWidth: 520 }}>
                    <div style={{ fontWeight: 700, wordBreak: "break-all" }}>{x.url}</div>
                    {x.title && <div className="muted" style={{ fontSize: 12 }}>{x.title}</div>}
                  </td>

                  <td>
                    <Pill kind={x.action === "ALLOW" ? "ok" : x.action === "WARN" ? "warn" : "bad"}>{x.action}</Pill>
                  </td>

                  <td>{x.riskLevel}</td>
                  <td>{x.label}</td>
                  <td>{typeof x.score === "number" ? x.score.toFixed(4) : "-"}</td>
                  <td>{x.source || "-"}</td>
                  <td>{fmtDate(x.createdAt)}</td>
                </tr>
              ))}

              {!loading && logs.length === 0 && (
                <tr>
                  <td colSpan={7} className="muted" style={{ padding: 16 }}>
                    Chưa có log. Hãy mở web bất kỳ để Extension scan, hoặc dùng Scan page.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {loading && <div className="muted" style={{ marginTop: 10 }}>Đang tải logs…</div>}
      </Card>
    </div>
  );
}