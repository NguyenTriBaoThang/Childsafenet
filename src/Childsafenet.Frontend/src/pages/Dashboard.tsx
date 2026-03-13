import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import {
  getLogsApi,
  getSettingsApi,
  updateSettingsApi,
  type SettingsResponse,
} from "../api/client";
import {
  listenExtEvents,
  pingExtension,
  pairExtension,
  toggleExtension,
} from "../extension/pair";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Pill } from "../components/Pill";

type LogAction = "ALLOW" | "WARN" | "BLOCK";

type LogItem = {
  id: string;
  url: string;
  title?: string;
  label: string;
  riskLevel: string;
  score: number;
  action: LogAction;
  source?: string;
  createdAt: string;
};

type LogsResponse = {
  total: number;
  page: number;
  pageSize: number;
  items: LogItem[];
};

const EXTENSION_DOWNLOAD_URL =
  "https://drive.google.com/file/d/1EfxIiVV4RAWwvFSAY9auKoveZBVU1nNQ/view?usp=sharing";

function fmtDate(s: string) {
  if (!s) return "-";

  let value = s.trim();
  const hasTimezone = /z$|[+-]\d{2}:\d{2}$/i.test(value);
  if (!hasTimezone) value += "Z";

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return s;

  return d.toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function getDomain(url: string) {
  try {
    const u = new URL(url.startsWith("http") ? url : `http://${url}`);
    return u.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return url
      .replace(/^https?:\/\//, "")
      .split("/")[0]
      .replace(/^www\./, "")
      .toLowerCase();
  }
}

function getWebsiteTitle(x: LogItem) {
  const domain = getDomain(x.url);
  const rawTitle = (x.title || "").trim();

  if (rawTitle && rawTitle.toLowerCase() !== domain.toLowerCase()) {
    return rawTitle;
  }

  return domain;
}

function getSummary(x: LogItem, manuallyBlocked: boolean) {
  if (manuallyBlocked) {
    return "Website đang bị phụ huynh chặn thủ công.";
  }

  if (x.action === "BLOCK") {
    return "Website đã bị hệ thống chặn truy cập.";
  }

  if (x.action === "WARN") {
    return "Website đã được cảnh báo và cần phụ huynh xem lại.";
  }

  return "Website được cho phép truy cập.";
}

function getReasonText(x: LogItem, manuallyBlocked: boolean) {
  if (manuallyBlocked) {
    return "Website này đang nằm trong danh sách chặn thủ công của phụ huynh.";
  }

  if (x.action === "BLOCK") {
    return "Hệ thống đã quyết định chặn website này dựa trên kết quả phân tích an toàn.";
  }

  if (x.action === "WARN") {
    return "Hệ thống đã quyết định cảnh báo vì website này có dấu hiệu cần thận trọng.";
  }

  return "Hệ thống đã quyết định cho phép truy cập website này.";
}

function riskText(riskLevel: string) {
  const value = (riskLevel || "").toUpperCase();
  if (value === "HIGH") return "High";
  if (value === "MEDIUM") return "Medium";
  return "Low";
}

export default function Dashboard() {
  const { role } = useAuth();

  const [extReady, setExtReady] = useState(false);
  const [extEnabled, setExtEnabled] = useState<boolean | null>(null);
  const [extMsg, setExtMsg] = useState("Đang kiểm tra kết nối Extension...");
  const [busy, setBusy] = useState<"toggle_on" | "toggle_off" | "pair" | "ping" | null>(null);

  const [testUrl, setTestUrl] = useState("https://www.google.com");

  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [serverTotal, setServerTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [err, setErr] = useState<string | null>(null);
  const [settings, setSettings] = useState<SettingsResponse | null>(null);
  const [savingBlock, setSavingBlock] = useState<string | null>(null);
  const [logsNotice, setLogsNotice] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [decisionFilter, setDecisionFilter] = useState<"ALL" | LogAction>("ALL");
  const [riskFilter, setRiskFilter] = useState<"ALL" | "LOW" | "MEDIUM" | "HIGH">("ALL");
  const [sourceFilter, setSourceFilter] = useState<"ALL" | "Web" | "Extension">("ALL");

  const [selectedLog, setSelectedLog] = useState<LogItem | null>(null);

  const initialPairedRef = useRef(false);

  const blacklist = useMemo(
    () => new Set((settings?.blacklist ?? []).map((x) => getDomain(x))),
    [settings]
  );

  const loadSettings = useCallback(async () => {
    try {
      const res = await getSettingsApi();
      setSettings(res);
    } catch (e) {
      console.error("load settings failed", e);
    }
  }, []);

  const loadLogs = useCallback(
    async (nextPage = page, nextPageSize = pageSize) => {
      setLoading(true);
      setErr(null);

      try {
        const res: LogsResponse = await getLogsApi(nextPage, nextPageSize);
        setLogs(Array.isArray(res.items) ? res.items : []);
        setServerTotal(res.total ?? 0);
        setPage(res.page ?? nextPage);
        setPageSize(res.pageSize ?? nextPageSize);
      } catch (e: any) {
        setErr("Không load được logs: " + (e?.response?.data?.message || e?.message || String(e)));
      } finally {
        setLoading(false);
      }
    },
    [page, pageSize]
  );

  const detectAndPair = useCallback(async () => {
    setBusy("ping");
    const ping = await pingExtension(1200);
    setBusy(null);

    if (!ping.ok) {
      setExtReady(false);
      setExtEnabled(null);
      setExtMsg("Extension không thể kết nối, vui lòng xem lại bạn đã thiết lập Extension chưa.");
      return;
    }

    setExtReady(true);
    if (typeof ping.enabled === "boolean") {
      setExtEnabled(!!ping.enabled);
    }

    const token = localStorage.getItem("csn_token") || "";
    if (!token) {
      setExtMsg("Không tìm thấy token đăng nhập. Vui lòng đăng nhập lại.");
      return;
    }

    setBusy("pair");
    const pair = await pairExtension(token, 1200);
    setBusy(null);

    if (pair.ok) {
      setExtReady(true);
      if (typeof pair.enabled === "boolean") {
        setExtEnabled(!!pair.enabled);
      }
      setExtMsg("Extension đã kết nối thành công.");
      initialPairedRef.current = true;
    } else {
      setExtReady(false);
      setExtEnabled(null);
      setExtMsg("Extension không thể kết nối, vui lòng xem lại bạn đã thiết lập Extension chưa.");
    }
  }, []);

  useEffect(() => {
    loadSettings();
    loadLogs(page, pageSize);

    if (!initialPairedRef.current) {
      detectAndPair();
    }
  }, [detectAndPair, loadLogs, loadSettings, page, pageSize]);

  useEffect(() => {
    const un = listenExtEvents((data: any) => {
      if (data?.type === "CSN_EXT_HELLO") {
        setExtReady(true);
        if (typeof data.enabled === "boolean") {
          setExtEnabled(!!data.enabled);
        }
        setExtMsg("Extension đã kết nối thành công.");
      }

      if (data?.type === "CSN_PAIR_RESULT") {
        if (data.ok) {
          setExtReady(true);
          if (typeof data.enabled === "boolean") {
            setExtEnabled(!!data.enabled);
          }
          setExtMsg("Extension đã kết nối thành công.");
        } else {
          setExtReady(false);
          setExtEnabled(null);
          setExtMsg("Extension không thể kết nối, vui lòng xem lại bạn đã thiết lập Extension chưa.");
        }
      }

      if (data?.type === "CSN_TOGGLE_RESULT" && data.ok) {
        setExtEnabled(!!data.enabled);
        setExtMsg(data.enabled ? "Extension đã được bật thành công." : "Extension đã được tắt thành công.");
      }

      if (
        data?.type === "CSN_SCAN_RESULT" ||
        data?.type === "CSN_SCAN_DONE" ||
        data?.type === "CSN_LOG_CREATED" ||
        data?.type === "CSN_BLOCKED"
      ) {
        loadLogs(1, pageSize);
      }
    });

    return un;
  }, [loadLogs, pageSize]);

  const doToggle = async (enabled: boolean) => {
    if (!extReady) return;

    setBusy(enabled ? "toggle_on" : "toggle_off");
    const res = await toggleExtension(enabled, 1200);
    setBusy(null);

    if (!res.ok) {
      setExtReady(false);
      setExtEnabled(null);
      setExtMsg("Không thể gửi lệnh đến Extension. Vui lòng kiểm tra lại Extension.");
      return;
    }

    setExtReady(true);
    setExtEnabled(!!res.enabled);
    setExtMsg(res.enabled ? "Extension đã được bật thành công." : "Extension đã được tắt thành công.");
  };

  const openTestUrl = () => {
    const url = testUrl.trim();
    if (!url) return;
    window.open(url, "_blank");
  };

  const downloadExtension = () => {
    window.open(EXTENSION_DOWNLOAD_URL, "_blank");
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((x) => {
      const domain = getDomain(x.url);
      const q = query.trim().toLowerCase();

      const matchQuery =
        !q ||
        x.url.toLowerCase().includes(q) ||
        domain.includes(q) ||
        (x.title || "").toLowerCase().includes(q);

      const matchDecision = decisionFilter === "ALL" || x.action === decisionFilter;
      const matchRisk = riskFilter === "ALL" || (x.riskLevel || "").toUpperCase() === riskFilter;
      const matchSource =
        sourceFilter === "ALL" ||
        (x.source || "").toLowerCase() === sourceFilter.toLowerCase();

      return matchQuery && matchDecision && matchRisk && matchSource;
    });
  }, [logs, query, decisionFilter, riskFilter, sourceFilter]);

  const stats = useMemo(() => {
    const total = logs.length;
    const allow = logs.filter((x) => x.action === "ALLOW").length;
    const warn = logs.filter((x) => x.action === "WARN").length;
    const block = logs.filter((x) => x.action === "BLOCK").length;
    return { total, allow, warn, block };
  }, [logs]);

  const totalPages = Math.max(1, Math.ceil((serverTotal || 0) / pageSize));
  const startItem = serverTotal === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, serverTotal);

  const isManualBlocked = (domain: string) => blacklist.has(domain);

  const getBlockActionText = (domain: string, row: LogItem) => {
    if (blacklist.has(domain)) return "Unblock";
    if (row.action === "BLOCK") return "Allow";
    return "Block";
  };

  const toggleBlockForDomain = async (row: LogItem) => {
    if (!settings) return;

    const domain = getDomain(row.url);
    if (!domain) return;

    setSavingBlock(domain);

    try {
      const currentBlacklist = [...new Set((settings.blacklist ?? []).map((x) => getDomain(x)))];
      const currentWhitelist = [...new Set((settings.whitelist ?? []).map((x) => getDomain(x)))];

      const manuallyBlocked = currentBlacklist.includes(domain);

      let nextBlacklist = [...currentBlacklist];
      let nextWhitelist = [...currentWhitelist];

      if (manuallyBlocked) {
        nextBlacklist = nextBlacklist.filter((x) => x !== domain);

        if (!nextWhitelist.includes(domain)) {
          nextWhitelist.push(domain);
        }
      } else {
        nextWhitelist = nextWhitelist.filter((x) => x !== domain);

        if (!nextBlacklist.includes(domain)) {
          nextBlacklist.push(domain);
        }
      }

      const payload = {
        childAge: settings.childAge,
        mode: settings.mode,
        whitelist: nextWhitelist,
        blacklist: nextBlacklist,
        blockAdult: settings.blockAdult,
        blockGambling: settings.blockGambling,
        blockPhishing: settings.blockPhishing,
        warnSuspicious: settings.warnSuspicious,
      };

      const updated = await updateSettingsApi(payload);
      setSettings(updated);

      setLogsNotice(
        manuallyBlocked
          ? `Đã bỏ chặn ${domain}. Website này đã được chuyển sang danh sách cho phép.`
          : `Đã chặn ${domain}. Website này đã được thêm vào danh sách chặn.`
      );

      await loadLogs(1, pageSize);
    } catch (e: any) {
      setErr(
        "Không cập nhật được danh sách chặn: " +
          (e?.response?.data?.message || e?.message || String(e))
      );
    } finally {
      setSavingBlock(null);
    }
  };

  const selectedDomain = selectedLog ? getDomain(selectedLog.url) : "";
  const selectedManualBlocked = selectedDomain ? isManualBlocked(selectedDomain) : false;

  return (
    <div className="page">
      <div className="pageHeader">
        <div>
          <h1>Bảng điều khiển</h1>
          <p className="muted">
            • Theo dõi hoạt động truy cập và kiểm soát website theo thời gian thực
          </p>
        </div>
      </div>

      <Card style={{ marginTop: 16 }}>
        <div className="rowBetween">
          <div>
            <h3 style={{ marginBottom: 6 }}>Chrome Extension</h3>
            <div className="muted">
              Hệ thống sẽ tự động kiểm tra và kết nối Extension khi bạn mở Bảng điều khiển.
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Button onClick={downloadExtension}>Tải Extension</Button>
            <Pill kind={extReady ? "ok" : "warn"}>
              {extReady ? `READY${extEnabled === null ? "" : extEnabled ? " • ON" : " • OFF"}` : "NOT READY"}
            </Pill>
          </div>
        </div>

        <div className="csnExtActions">
          <Button
            variant="ghost"
            onClick={() => doToggle(true)}
            disabled={!extReady || busy !== null}
          >
            {busy === "toggle_on" ? "Đang bật..." : "Bật Extension"}
          </Button>

          <Button
            variant="ghost"
            onClick={() => doToggle(false)}
            disabled={!extReady || busy !== null}
          >
            {busy === "toggle_off" ? "Đang tắt..." : "Tắt Extension"}
          </Button>
        </div>

        <div className={`csnExtNotice ${extReady ? "ok" : "warn"}`}>
          {extMsg}
        </div>

        <div className="csnOpenUrlRow">
          <div className="muted">
              Nhập URL để mở kiểm tra bằng Extension:
          </div>
          <Input
            value={testUrl}
            onChange={(e: any) => setTestUrl(e.target.value)}
            placeholder="Nhập URL để mở test bằng Extension"
            style={{ flex: 1, minWidth: 260 }}
          />
          <Button variant="ghost" onClick={openTestUrl}>
            Open URL
          </Button>
        </div>
      </Card>

      <div className="grid4" style={{ marginTop: 16 }}>
        <Card className="statCard">
          <div className="muted">Loaded logs</div>
          <div className="statValue">{stats.total}</div>
        </Card>
        <Card className="statCard">
          <div className="muted">Allowed</div>
          <div className="statValue">{stats.allow}</div>
        </Card>
        <Card className="statCard">
          <div className="muted">Warning</div>
          <div className="statValue">{stats.warn}</div>
        </Card>
        <Card className="statCard">
          <div className="muted">Blocked</div>
          <div className="statValue">{stats.block}</div>
        </Card>
      </div>

      <Card style={{ marginTop: 16 }}>
        <div className="rowBetween" style={{ marginBottom: 12, gap: 12, flexWrap: "wrap" }}>
          <div>
            <h3 style={{ marginBottom: 6 }}>Browsing Activity & Protection Logs</h3>
            <div className="muted">
              Bảng sẽ cập nhật khi có website mới được scan hoặc khi bạn thao tác trên Dashboard.
            </div>

            {logsNotice && (
              <div className="csnLogsNotice ok" style={{ marginTop: 10 }}>
                {logsNotice}
              </div>
            )}
          </div>

          <Button variant="ghost" onClick={() => loadLogs(page, pageSize)} disabled={loading}>
            Refresh Logs
          </Button>
        </div>

        <div className="csnLogsMeta" style={{ marginBottom: 10 }}>
          Showing <b>{startItem}</b>–<b>{endItem}</b> of <b>{serverTotal}</b> logs
        </div>

        {err && (
          <div className="error" style={{ marginTop: 12 }}>
            {err}
          </div>
        )}

        <div className="csnToolbar">
          <div className="csnToolbarSearch">
            <Input
              value={query}
              onChange={(e: any) => setQuery(e.target.value)}
              placeholder="Search by URL, domain, or title..."
            />
          </div>

          <select
            className="csnSelect"
            value={decisionFilter}
            onChange={(e) => setDecisionFilter(e.target.value as "ALL" | LogAction)}
          >
            <option value="ALL">All decisions</option>
            <option value="ALLOW">ALLOW</option>
            <option value="WARN">WARN</option>
            <option value="BLOCK">BLOCK</option>
          </select>

          <select
            className="csnSelect"
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value as "ALL" | "LOW" | "MEDIUM" | "HIGH")}
          >
            <option value="ALL">All risks</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
          </select>

          <select
            className="csnSelect"
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as "ALL" | "Web" | "Extension")}
          >
            <option value="ALL">All sources</option>
            <option value="Web">Web</option>
            <option value="Extension">Extension</option>
          </select>

          <select
            className="csnSelect"
            value={pageSize}
            onChange={(e) => {
              setPage(1);
              setPageSize(Number(e.target.value));
            }}
          >
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>

        <div className="tableWrap">
          <table className="table csnLogsTable">
            <thead>
              <tr>
                <th>Website</th>
                <th>Decision</th>
                <th>Risk</th>
                <th>Source</th>
                <th>Time</th>
                <th>View</th>
                <th>Block</th>
              </tr>
            </thead>

            <tbody>
              {filteredLogs.map((x) => {
                const domain = getDomain(x.url);
                const manuallyBlocked = isManualBlocked(domain);
                const rowSaving = savingBlock === domain;

                return (
                  <tr key={x.id}>
                    <td style={{ minWidth: 320 }}>
                      <div className="csnWebsiteCell">
                        <div className="csnWebsiteTitle">{getWebsiteTitle(x)}</div>
                        <div className="csnWebsiteDomain">{domain}</div>
                        <div className="csnWebsiteSummary">
                          {getSummary(x, manuallyBlocked)}
                        </div>
                      </div>
                    </td>

                    <td>
                      <Pill
                        kind={
                          x.action === "ALLOW"
                            ? "ok"
                            : x.action === "WARN"
                              ? "warn"
                              : "bad"
                        }
                      >
                        {x.action}
                      </Pill>
                    </td>

                    <td>
                      <span
                        className={
                          (x.riskLevel || "").toUpperCase() === "HIGH"
                            ? "csnRiskHigh"
                            : (x.riskLevel || "").toUpperCase() === "MEDIUM"
                              ? "csnRiskMedium"
                              : "csnRiskLow"
                        }
                      >
                        {riskText(x.riskLevel)}
                      </span>
                    </td>

                    <td>{x.source || "-"}</td>
                    <td>{fmtDate(x.createdAt)}</td>

                    <td>
                      <Button variant="ghost" onClick={() => setSelectedLog(x)}>
                        View
                      </Button>
                    </td>

                    <td>
                      <label className={`csnBlockToggle ${rowSaving ? "disabled" : ""}`}>
                        <input
                          type="checkbox"
                          checked={manuallyBlocked}
                          disabled={rowSaving}
                          onChange={() => toggleBlockForDomain(x)}
                        />
                        <span className="csnBlockSlider" />
                        <span className="csnBlockLabel">
                          {rowSaving ? "Saving..." : getBlockActionText(domain, x)}
                        </span>
                      </label>
                    </td>
                  </tr>
                );
              })}

              {!loading && filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={7} className="muted" style={{ padding: 16 }}>
                    Không có log phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="csnPagination">
          <div className="muted">
            Page <b>{page}</b> / <b>{totalPages}</b>
          </div>

          <div className="csnPaginationActions">
            <Button
              variant="ghost"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
            >
              Previous
            </Button>

            <Button
              variant="ghost"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
            >
              Next
            </Button>
          </div>
        </div>

        {loading && (
          <div className="muted" style={{ marginTop: 10 }}>
            Đang tải logs…
          </div>
        )}
      </Card>

      {selectedLog && (
        <Card style={{ marginTop: 16 }}>
          <div className="rowBetween">
            <div>
              <h3 style={{ marginBottom: 6 }}>Website Details</h3>
              <div className="muted">
                Giải thích ngắn gọn để phụ huynh hiểu website này là gì và tại sao bị chặn hoặc cho phép.
              </div>
            </div>

            <Button variant="ghost" onClick={() => setSelectedLog(null)}>
              Close
            </Button>
          </div>

          <div className="csnDetailGrid">
            <div className="csnDetailItem">
              <div className="csnDetailLabel">Website</div>
              <div className="csnDetailValue">{getWebsiteTitle(selectedLog)}</div>
            </div>

            <div className="csnDetailItem">
              <div className="csnDetailLabel">Domain</div>
              <div className="csnDetailValue">{getDomain(selectedLog.url)}</div>
            </div>

            <div className="csnDetailItem csnDetailItemFull">
              <div className="csnDetailLabel">Full URL</div>
              <div className="csnDetailValue csnBreak">{selectedLog.url}</div>
            </div>

            <div className="csnDetailItem">
              <div className="csnDetailLabel">Decision</div>
              <div className="csnDetailValue">{selectedLog.action}</div>
            </div>

            <div className="csnDetailItem">
              <div className="csnDetailLabel">Risk</div>
              <div className="csnDetailValue">{riskText(selectedLog.riskLevel)}</div>
            </div>

            <div className="csnDetailItem">
              <div className="csnDetailLabel">Source</div>
              <div className="csnDetailValue">{selectedLog.source || "-"}</div>
            </div>

            <div className="csnDetailItem">
              <div className="csnDetailLabel">Time</div>
              <div className="csnDetailValue">{fmtDate(selectedLog.createdAt)}</div>
            </div>

            <div className="csnDetailItem csnDetailItemFull">
              <div className="csnDetailLabel">Summary</div>
              <div className="csnDetailValue">
                {getSummary(selectedLog, selectedManualBlocked)}
              </div>
            </div>

            <div className="csnDetailItem csnDetailItemFull">
              <div className="csnDetailLabel">Why this decision?</div>
              <div className="csnDetailValue">
                {getReasonText(selectedLog, selectedManualBlocked)}
              </div>
            </div>

            <div className="csnDetailItem">
              <div className="csnDetailLabel">AI Label</div>
              <div className="csnDetailValue">{selectedLog.label || "-"}</div>
            </div>

            <div className="csnDetailItem">
              <div className="csnDetailLabel">Confidence Score</div>
              <div className="csnDetailValue">
                {typeof selectedLog.score === "number"
                  ? selectedLog.score.toFixed(4)
                  : "-"}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}