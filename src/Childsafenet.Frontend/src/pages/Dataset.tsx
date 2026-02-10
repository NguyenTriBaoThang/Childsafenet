import React, { useEffect, useMemo, useState } from "react";
import { http } from "../api/http";
import { Button } from "../components/Button";

type DatasetItem = {
  id: string;
  url: string;
  host?: string;
  predictedLabel?: string;
  predictedScore?: number;
  status?: string; // Pending/Approved/Rejected
  source?: string; // Web/Extension
  firstSeenAt?: string;
  lastSeenAt?: string;
  seenCount?: number;
};

type PendingResponse = DatasetItem[] | { items: DatasetItem[] };

function fmtDate(s?: string) {
  if (!s) return "-";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleString();
}

function pickItems(res: PendingResponse): DatasetItem[] {
  // backend có thể trả array hoặc {items:[]}
  if (Array.isArray(res)) return res;
  return res.items ?? [];
}

export default function DatasetPage() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<DatasetItem[]>([]);
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  // chọn nhiều để approve/reject hàng loạt
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return items.filter((x) => {
      if (!query) return true;
      const s = `${x.url} ${x.host || ""} ${x.predictedLabel || ""}`.toLowerCase();
      return s.includes(query);
    });
  }, [items, q]);

  const selectedIds = useMemo(
    () => Object.entries(selected).filter(([, v]) => v).map(([k]) => k),
    [selected]
  );

  const loadPending = async () => {
    setLoading(true);
    setMsg(null);
    setSelected({});
    try {
      // ✅ đúng swagger
      const res = await api.get<PendingResponse>("/api/dataset/pending");
      setItems(pickItems(res.data));
    } catch (e: any) {
      setMsg("Load pending failed: " + (e?.message || String(e)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleAll = (checked: boolean) => {
    const next: Record<string, boolean> = {};
    filtered.forEach((x) => (next[x.id] = checked));
    setSelected(next);
  };

  const toggleOne = (id: string, checked: boolean) => {
    setSelected((prev) => ({ ...prev, [id]: checked }));
  };

  const approve = async (ids: string[]) => {
    if (ids.length === 0) return;
    setMsg(null);
    try {
      // ✅ swagger: POST /api/dataset/approve
      await api.post("/api/dataset/approve", { ids });
      setMsg(`✅ Approved ${ids.length} item(s).`);
      await loadPending();
    } catch (e: any) {
      setMsg("Approve failed: " + (e?.message || String(e)));
    }
  };

  const reject = async (ids: string[]) => {
    if (ids.length === 0) return;
    setMsg(null);
    try {
      // ✅ swagger: POST /api/dataset/reject
      await api.post("/api/dataset/reject", { ids });
      setMsg(`✅ Rejected ${ids.length} item(s).`);
      await loadPending();
    } catch (e: any) {
      setMsg("Reject failed: " + (e?.message || String(e)));
    }
  };

  const exportCsv = async () => {
    setMsg(null);
    try {
      // ✅ swagger: GET /api/dataset/export (trả file)
      const res = await api.get("/api/dataset/export", { responseType: "blob" });

      const blob = new Blob([res.data], { type: "text/csv;charset=utf-8" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `childsafenet_dataset_export_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setMsg("✅ Exported CSV.");
    } catch (e: any) {
      setMsg("Export failed: " + (e?.message || String(e)));
    }
  };

  return (
    <div className="page">
      <div className="pageHeader">
        <div>
          <h1>Dataset (Pending)</h1>
          <p className="muted">
            Danh sách URL đang chờ duyệt. (Option B: server sẽ train định kỳ từ dữ liệu đã duyệt)
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Button variant="ghost" onClick={loadPending} disabled={loading}>
            Refresh
          </Button>
          <Button variant="ghost" onClick={exportCsv}>
            Export CSV
          </Button>

          <Button onClick={() => approve(selectedIds)} disabled={selectedIds.length === 0}>
            Approve selected ({selectedIds.length})
          </Button>
          <Button variant="ghost" onClick={() => reject(selectedIds)} disabled={selectedIds.length === 0}>
            Reject selected ({selectedIds.length})
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
                <th style={{ width: 44 }}>
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && selectedIds.length === filtered.length}
                    onChange={(e) => toggleAll(e.target.checked)}
                  />
                </th>
                <th>URL</th>
                <th>Label</th>
                <th>Score</th>
                <th>Source</th>
                <th>Seen</th>
                <th>Last Seen</th>
                <th style={{ width: 180 }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((x) => (
                <tr key={x.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={!!selected[x.id]}
                      onChange={(e) => toggleOne(x.id, e.target.checked)}
                    />
                  </td>
                  <td style={{ maxWidth: 520 }}>
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
                  <td>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <Button onClick={() => approve([x.id])}>Approve</Button>
                      <Button variant="ghost" onClick={() => reject([x.id])}>
                        Reject
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="muted" style={{ padding: 16 }}>
                    Không có dữ liệu Pending.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {loading && (
          <div className="muted" style={{ marginTop: 12 }}>
            Đang tải...
          </div>
        )}
      </div>
    </div>
  );
}