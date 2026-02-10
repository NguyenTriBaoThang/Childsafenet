import React, { useEffect, useMemo, useState } from "react";
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
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? s : d.toLocaleString();
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

export default function AdminDataset() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<DatasetItem[]>([]);
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const selectedIds = useMemo(
    () => Object.keys(selected).filter((k) => selected[k]),
    [selected]
  );

  const filtered = useMemo(() => {
    const key = q.trim().toLowerCase();
    if (!key) return items;
    return items.filter((x) => {
      const s = `${x.url} ${x.host ?? ""} ${x.predictedLabel ?? ""}`.toLowerCase();
      return s.includes(key);
    });
  }, [items, q]);

  const load = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const data = await getDatasetPendingApi();
      setItems(data);
      setSelected({});
    } catch (e: any) {
      setMsg("Load pending dataset failed: " + (e?.message || String(e)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleAll = (checked: boolean) => {
    const next: Record<string, boolean> = {};
    filtered.forEach((x, idx) => {
      const id = x.id ?? `${idx}-${x.url}`;
      next[id] = checked;
    });
    setSelected(next);
  };

  const toggleOne = (id: string, checked: boolean) => {
    setSelected((prev) => ({ ...prev, [id]: checked }));
  };

  const approve = async () => {
    setMsg(null);
    if (selectedIds.length === 0) return setMsg("Chọn ít nhất 1 item để approve.");
    try {
      await approveDatasetApi(selectedIds);
      setMsg(`✅ Approved ${selectedIds.length} item(s).`);
      await load();
    } catch (e: any) {
      setMsg("Approve failed: " + (e?.message || String(e)));
    }
  };

  const reject = async () => {
    setMsg(null);
    if (selectedIds.length === 0) return setMsg("Chọn ít nhất 1 item để reject.");
    try {
      await rejectDatasetApi(selectedIds);
      setMsg(`✅ Rejected ${selectedIds.length} item(s).`);
      await load();
    } catch (e: any) {
      setMsg("Reject failed: " + (e?.message || String(e)));
    }
  };

  const exportCsv = async () => {
    setMsg(null);
    try {
      const blob = await exportDatasetApi();
      downloadBlob(blob, `childsafenet_dataset_export.csv`);
    } catch (e: any) {
      setMsg("Export failed: " + (e?.message || String(e)));
    }
  };

  return (
    <div className="page">
      <div className="pageHeader">
        <div>
          <h1>Admin • Dataset (Pending)</h1>
          <p className="muted">
            Option B: Thu thập URL → Pending → Admin duyệt → Train định kỳ.
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

      <div className="card" style={{ marginTop: 16 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <input
            className="input"
            placeholder="Search url / host / label..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ flex: 1, minWidth: 260 }}
          />
        </div>

        {msg && (
          <div className="alert" style={{ marginTop: 12 }}>
            {msg}
          </div>
        )}

        <div style={{ overflowX: "auto", marginTop: 14 }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 56 }}>
                  <input
                    type="checkbox"
                    onChange={(e) => toggleAll(e.target.checked)}
                    checked={filtered.length > 0 && selectedIds.length === filtered.length}
                  />
                </th>
                <th>URL</th>
                <th>Label</th>
                <th>Score</th>
                <th>Source</th>
                <th>Seen</th>
                <th>Last Seen</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((x, idx) => {
                const id = x.id ?? `${idx}-${x.url}`;
                return (
                  <tr key={id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={!!selected[id]}
                        onChange={(e) => toggleOne(id, e.target.checked)}
                      />
                    </td>
                    <td style={{ maxWidth: 560 }}>
                      <div style={{ fontWeight: 600, wordBreak: "break-all" }}>{x.url}</div>
                      <div className="muted" style={{ fontSize: 12 }}>
                        {x.host || "-"}
                      </div>
                    </td>
                    <td>{x.predictedLabel || "-"}</td>
                    <td>{typeof x.predictedScore === "number" ? x.predictedScore.toFixed(4) : "-"}</td>
                    <td>{x.source || "-"}</td>
                    <td>{x.seenCount ?? "-"}</td>
                    <td>{fmtDate(x.lastSeenAt)}</td>
                  </tr>
                );
              })}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="muted" style={{ padding: 16 }}>
                    Không có dữ liệu Pending.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {loading && <div className="muted" style={{ marginTop: 12 }}>Đang tải...</div>}
      </div>
    </div>
  );
}