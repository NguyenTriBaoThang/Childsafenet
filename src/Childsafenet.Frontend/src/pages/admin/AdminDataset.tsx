import { useEffect, useMemo, useState } from "react";
import { Button } from "../../components/Button";
import {
  approveDatasetApi,
  exportDatasetApi,
  getDatasetPendingApi,
  rejectDatasetApi,
} from "../../api/client";
import type { DatasetItem } from "../../api/client";

function fmtDate(s?: string) {
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

function downloadBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

function getDomain(url?: string) {
  const raw = (url || "").trim();
  if (!raw) return "-";

  try {
    const u = new URL(raw.startsWith("http") ? raw : `http://${raw}`);
    return u.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return raw
      .replace(/^https?:\/\//, "")
      .split("/")[0]
      .replace(/^www\./, "")
      .toLowerCase();
  }
}

function labelText(label?: string) {
  const s = (label || "").toLowerCase();
  if (!s) return "Chưa rõ";
  if (s.includes("adult") || s.includes("porn")) return "Nội dung người lớn";
  if (s.includes("gambling")) return "Cờ bạc / cá cược";
  if (s.includes("phishing")) return "Giả mạo / lừa đảo";
  if (s.includes("malware")) return "Nguy cơ độc hại";
  if (s.includes("benign")) return "Website phổ thông";
  if (s.includes("whitelist")) return "Cho phép thủ công";
  if (s.includes("blacklist")) return "Chặn thủ công";
  return label || "Chưa rõ";
}

function labelKind(label?: string): "ok" | "warn" | "bad" {
  const s = (label || "").toLowerCase();
  if (s.includes("benign") || s.includes("whitelist")) return "ok";
  if (
    s.includes("adult") ||
    s.includes("porn") ||
    s.includes("gambling") ||
    s.includes("phishing") ||
    s.includes("malware") ||
    s.includes("blacklist")
  ) {
    return "bad";
  }
  return "warn";
}

function actionKind(action?: string): "ok" | "warn" | "bad" {
  const s = (action || "").toUpperCase();
  if (s === "ALLOW") return "ok";
  if (s === "BLOCK") return "bad";
  return "warn";
}

function actionText(action?: string) {
  const s = (action || "").toUpperCase();
  if (s === "ALLOW") return "ALLOW";
  if (s === "BLOCK") return "BLOCK";
  return "WARN";
}

function buildDatasetSummary(x: DatasetItem) {
  const domain = getDomain(x.url);
  const action = actionText((x as any).predictedAction);
  const niceLabel = labelText(x.predictedLabel);

  if (action === "BLOCK") {
    return `Website thuộc tên miền ${domain}, hiện có xu hướng bị hệ thống chặn. Admin nên kiểm tra xem website này có thực sự nguy hiểm hoặc không phù hợp với trẻ hay không.`;
  }

  if (action === "WARN") {
    return `Website thuộc tên miền ${domain}, hiện ở mức cần cảnh báo. Admin nên xem kỹ trước khi quyết định đưa vào tập huấn luyện.`;
  }

  if (niceLabel === "Website phổ thông") {
    return `Website thuộc tên miền ${domain}, hiện được AI đánh giá là website phổ thông hoặc ít rủi ro.`;
  }

  return `Website thuộc tên miền ${domain}, hiện đang chờ admin xem xét và xác nhận nhãn dữ liệu.`;
}

export default function AdminDataset() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<DatasetItem[]>([]);
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const [labelFilter, setLabelFilter] = useState("ALL");
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [actionFilter, setActionFilter] = useState("ALL");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [activeId, setActiveId] = useState<string | null>(null);

  const selectedIds = useMemo(
    () => Object.keys(selected).filter((k) => selected[k]),
    [selected]
  );

  const labelOptions = useMemo(() => {
    const set = new Set<string>();
    items.forEach((x) => {
      if (x.predictedLabel) set.add(x.predictedLabel);
    });
    return ["ALL", ...Array.from(set)];
  }, [items]);

  const sourceOptions = useMemo(() => {
    const set = new Set<string>();
    items.forEach((x) => {
      if (x.source) set.add(x.source);
    });
    return ["ALL", ...Array.from(set)];
  }, [items]);

  const filtered = useMemo(() => {
    const key = q.trim().toLowerCase();

    return items.filter((x: any) => {
      const haystack =
        `${x.url} ${x.host ?? ""} ${x.predictedLabel ?? ""} ${x.predictedAction ?? ""} ${x.source ?? ""}`.toLowerCase();

      const matchSearch = !key || haystack.includes(key);
      const matchLabel =
        labelFilter === "ALL" || (x.predictedLabel || "") === labelFilter;
      const matchSource =
        sourceFilter === "ALL" || (x.source || "") === sourceFilter;
      const matchAction =
        actionFilter === "ALL" ||
        ((x.predictedAction || "").toUpperCase() === actionFilter);

      return matchSearch && matchLabel && matchSource && matchAction;
    });
  }, [items, q, labelFilter, sourceFilter, actionFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const pagedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const pageSelectedCount = useMemo(() => {
    return pagedItems.filter((x, idx) => {
      const id = (x.id ?? `${idx}-${x.url}`) as string;
      return !!selected[id];
    }).length;
  }, [pagedItems, selected]);

  const activeItem = useMemo(() => {
    if (!pagedItems.length) return null;

    const found = pagedItems.find(
      (x, idx) => ((x.id ?? `${idx}-${x.url}`) as string) === activeId
    );

    if (found) return found;
    return pagedItems[0];
  }, [pagedItems, activeId]);

  const load = async () => {
    setLoading(true);
    setMsg(null);

    try {
      const data = await getDatasetPendingApi();
      setItems(data);
      setSelected({});
      setPage(1);

      if (data.length > 0) {
        const firstId = (data[0].id ?? `0-${data[0].url}`) as string;
        setActiveId(firstId);
      } else {
        setActiveId(null);
      }
    } catch (e: any) {
      setMsg("Không tải được danh sách pending dataset: " + (e?.message || String(e)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [q, labelFilter, sourceFilter, actionFilter, pageSize]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const toggleAllCurrentPage = (checked: boolean) => {
    const next = { ...selected };
    pagedItems.forEach((x, idx) => {
      const id = (x.id ?? `${idx}-${x.url}`) as string;
      next[id] = checked;
    });
    setSelected(next);
  };

  const toggleOne = (id: string, checked: boolean) => {
    setSelected((prev) => ({ ...prev, [id]: checked }));
  };

  const approve = async () => {
    setMsg(null);
    if (selectedIds.length === 0) {
      setMsg("Chọn ít nhất 1 website để approve.");
      return;
    }

    try {
      await approveDatasetApi(selectedIds);
      setMsg(`✅ Đã approve ${selectedIds.length} website.`);
      await load();
    } catch (e: any) {
      setMsg("Approve thất bại: " + (e?.message || String(e)));
    }
  };

  const reject = async () => {
    setMsg(null);
    if (selectedIds.length === 0) {
      setMsg("Chọn ít nhất 1 website để reject.");
      return;
    }

    try {
      await rejectDatasetApi(selectedIds);
      setMsg(`✅ Đã reject ${selectedIds.length} website.`);
      await load();
    } catch (e: any) {
      setMsg("Reject thất bại: " + (e?.message || String(e)));
    }
  };

  const exportCsv = async () => {
    setMsg(null);
    try {
      const blob = await exportDatasetApi();
      downloadBlob(blob, "childsafenet_dataset_export.csv");
    } catch (e: any) {
      setMsg("Export thất bại: " + (e?.message || String(e)));
    }
  };

  const startItem = filtered.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, filtered.length);

  return (
    <div className="page">
      <div className="pageHeader">
        <div>
          <h1>Admin Dataset Review</h1>
          <p className="muted">
            Duyệt dữ liệu pending trước khi đưa vào tập huấn luyện. Admin có thể xem website, nhãn AI, hành động hệ thống và quyết định approve hoặc reject.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Button variant="ghost" onClick={load} disabled={loading}>
            Refresh
          </Button>
          <Button variant="ghost" onClick={exportCsv}>
            Export CSV
          </Button>
          <Button onClick={approve} disabled={selectedIds.length === 0}>
            Approve
          </Button>
          <Button variant="ghost" onClick={reject} disabled={selectedIds.length === 0}>
            Reject
          </Button>
        </div>
      </div>

      <div className="csnDatasetAdminLayout" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="csnDatasetToolbar">
            <input
              className="input"
              placeholder="Tìm theo URL / host / label / action / source..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />

            <select
              className="csnSelect"
              value={labelFilter}
              onChange={(e) => setLabelFilter(e.target.value)}
            >
              {labelOptions.map((x) => (
                <option key={x} value={x}>
                  {x === "ALL" ? "Tất cả nhãn AI" : x}
                </option>
              ))}
            </select>

            <select
              className="csnSelect"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
            >
              <option value="ALL">Tất cả action</option>
              <option value="ALLOW">ALLOW</option>
              <option value="WARN">WARN</option>
              <option value="BLOCK">BLOCK</option>
            </select>

            <select
              className="csnSelect"
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
            >
              {sourceOptions.map((x) => (
                <option key={x} value={x}>
                  {x === "ALL" ? "Tất cả nguồn" : x}
                </option>
              ))}
            </select>
          </div>

          {msg && (
            <div className="alert" style={{ marginTop: 12 }}>
              {msg}
            </div>
          )}

          <div className="csnDatasetStats">
            <div className="csnDatasetStatBox">
              <div className="muted">Sau lọc</div>
              <div className="csnDatasetStatValue">{filtered.length}</div>
            </div>
            <div className="csnDatasetStatBox">
              <div className="muted">Đã chọn</div>
              <div className="csnDatasetStatValue">{selectedIds.length}</div>
            </div>
            <div className="csnDatasetStatBox">
              <div className="muted">Trang hiện tại</div>
              <div className="csnDatasetStatValue">
                {startItem}-{endItem}
              </div>
            </div>
          </div>

          <div className="csnDatasetPageMeta">
            Showing <b>{startItem}</b>–<b>{endItem}</b> of <b>{filtered.length}</b> websites
          </div>

          <div className="tableWrap">
            <table className="table csnDatasetTable">
              <thead>
                <tr>
                  <th style={{ width: 56 }}>
                    <input
                      type="checkbox"
                      onChange={(e) => toggleAllCurrentPage(e.target.checked)}
                      checked={pagedItems.length > 0 && pageSelectedCount === pagedItems.length}
                    />
                  </th>
                  <th>Website</th>
                  <th>Action</th>
                  <th>AI Label</th>
                  <th>Score</th>
                  <th>Source</th>
                  <th>Seen</th>
                </tr>
              </thead>
              <tbody>
                {pagedItems.map((x: any, idx) => {
                  const id = (x.id ?? `${idx}-${x.url}`) as string;
                  const isActive = !!activeItem && ((activeItem.id ?? `${pagedItems.indexOf(activeItem)}-${activeItem.url}`) as string) === id;

                  return (
                    <tr
                      key={id}
                      className={isActive ? "csnDatasetRowActive" : ""}
                      onClick={() => setActiveId(id)}
                      style={{ cursor: "pointer" }}
                    >
                      <td onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={!!selected[id]}
                          onChange={(e) => toggleOne(id, e.target.checked)}
                        />
                      </td>

                      <td style={{ maxWidth: 520 }}>
                        <div className="csnDatasetSiteTitle">{getDomain(x.url)}</div>
                        <div className="csnDatasetSiteUrl">{x.url}</div>
                        <div className="csnDatasetSiteSummary">{buildDatasetSummary(x)}</div>
                      </td>

                      <td>
                        <span className={`pill ${actionKind(x.predictedAction)}`}>
                          {actionText(x.predictedAction)}
                        </span>
                      </td>

                      <td>
                        <span className={`pill ${labelKind(x.predictedLabel)}`}>
                          {labelText(x.predictedLabel)}
                        </span>
                      </td>

                      <td>
                        {typeof x.predictedScore === "number"
                          ? x.predictedScore.toFixed(4)
                          : "-"}
                      </td>

                      <td>{x.source || "-"}</td>
                      <td>{x.seenCount ?? "-"}</td>
                    </tr>
                  );
                })}

                {!loading && pagedItems.length === 0 && (
                  <tr>
                    <td colSpan={7} className="muted" style={{ padding: 16 }}>
                      Không có dữ liệu pending phù hợp bộ lọc.
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
              <select
                className="csnSelect"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                style={{ width: 120 }}
              >
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
              </select>

              <Button
                variant="ghost"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Previous
              </Button>

              <Button
                variant="ghost"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>

          {loading && <div className="muted" style={{ marginTop: 12 }}>Đang tải...</div>}
        </div>

        <div className="card csnDatasetDetailCard">
          <div className="csnDatasetDetailHeader">
            <div>
              <div className="cardTitle">Chi tiết website đang chọn</div>
              <div className="cardText">
                Panel này giúp admin đọc nhanh website đó là gì, hệ thống đang xử lý ra sao, và cân nhắc approve hay reject.
              </div>
            </div>
          </div>

          {!activeItem && (
            <div className="muted">Chưa có website nào để hiển thị.</div>
          )}

          {activeItem && (
            <div className="stack">
              <div className="csnDatasetDetailBlock">
                <div className="csnDatasetDetailLabel">Domain</div>
                <div className="csnDatasetDetailValue">{getDomain(activeItem.url)}</div>
              </div>

              <div className="csnDatasetDetailBlock">
                <div className="csnDatasetDetailLabel">Full URL</div>
                <div className="csnDatasetDetailValue csnBreak">{activeItem.url}</div>
              </div>

              <div className="csnDatasetDetailGrid">
                <div className="csnDatasetDetailBlock">
                  <div className="csnDatasetDetailLabel">Action</div>
                  <div className="csnDatasetDetailValue">{actionText((activeItem as any).predictedAction)}</div>
                </div>

                <div className="csnDatasetDetailBlock">
                  <div className="csnDatasetDetailLabel">AI Label</div>
                  <div className="csnDatasetDetailValue">{labelText(activeItem.predictedLabel)}</div>
                </div>

                <div className="csnDatasetDetailBlock">
                  <div className="csnDatasetDetailLabel">AI Score</div>
                  <div className="csnDatasetDetailValue">
                    {typeof activeItem.predictedScore === "number"
                      ? activeItem.predictedScore.toFixed(4)
                      : "-"}
                  </div>
                </div>

                <div className="csnDatasetDetailBlock">
                  <div className="csnDatasetDetailLabel">Source</div>
                  <div className="csnDatasetDetailValue">{activeItem.source || "-"}</div>
                </div>

                <div className="csnDatasetDetailBlock">
                  <div className="csnDatasetDetailLabel">Seen Count</div>
                  <div className="csnDatasetDetailValue">{activeItem.seenCount ?? "-"}</div>
                </div>

                <div className="csnDatasetDetailBlock">
                  <div className="csnDatasetDetailLabel">Last Seen</div>
                  <div className="csnDatasetDetailValue">{fmtDate(activeItem.lastSeenAt)}</div>
                </div>
              </div>

              <div className="csnDatasetDetailBlock">
                <div className="csnDatasetDetailLabel">Tóm tắt nội dung để admin dễ duyệt</div>
                <div className="csnDatasetDetailValue">
                  {buildDatasetSummary(activeItem)}
                </div>
              </div>

              <div className="csnDatasetDecisionHelp">
                <div className="csnDatasetDecisionTitle">Gợi ý cho admin</div>
                <div className="cardText">
                  Nếu <b>Action = BLOCK</b> hoặc <b>WARN</b> và website thực sự là nội dung nguy hiểm, giả mạo, cờ bạc, người lớn hoặc không phù hợp với trẻ em thì nên <b>Approve</b>. Nếu AI phân loại sai hoặc website không nên đưa vào train set thì chọn <b>Reject</b>.
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Button
                  onClick={() => {
                    const id = (activeItem.id ?? activeItem.url) as string;
                    setSelected((prev) => ({ ...prev, [id]: true }));
                  }}
                >
                  Chọn website này
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => window.open(activeItem.url, "_blank")}
                >
                  Mở website
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}