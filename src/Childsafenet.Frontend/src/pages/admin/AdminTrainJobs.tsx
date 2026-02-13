import { useEffect, useState } from "react";
import { Button } from "../../components/Button";
import { getTrainJobsApi, triggerTrainApi } from "../../api/client";
import type { TrainJob } from "../../api/client";

function fmtDate(s?: string) {
  if (!s) return "-";
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? s : d.toLocaleString();
}

export default function AdminTrainJobs() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<TrainJob[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const data = await getTrainJobsApi();
      setItems(data);
    } catch (e: any) {
      setMsg("Load train jobs failed: " + (e?.message || String(e)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const trigger = async () => {
    setMsg(null);
    try {
      await triggerTrainApi();
      setMsg("✅ Triggered train job. Hệ thống sẽ chạy background/định kỳ.");
      await load();
    } catch (e: any) {
      setMsg("Trigger train failed: " + (e?.message || String(e)));
    }
  };

  return (
    <div className="page">
      <div className="pageHeader">
        <div>
          <h1>Admin • Train Jobs</h1>
          <p className="muted">Option B: Trigger train → jobs chạy background → có version model mới.</p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Button variant="ghost" onClick={load} disabled={loading}>
            Refresh
          </Button>
          <Button onClick={trigger}>Trigger Train</Button>
        </div>
      </div>

      {msg && (
        <div className="alert" style={{ marginTop: 12 }}>
          {msg}
        </div>
      )}

      <div className="card" style={{ marginTop: 16, overflowX: "auto" }}>
        <table className="table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Created</th>
              <th>Started</th>
              <th>Finished</th>
              <th>Model Version</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {items.map((x, idx) => (
              <tr key={x.id || idx}>
                <td>{x.status || "-"}</td>
                <td>{fmtDate(x.createdAt)}</td>
                <td>{fmtDate(x.startedAt)}</td>
                <td>{fmtDate(x.finishedAt)}</td>
                <td>{x.modelVersion || "-"}</td>
                <td style={{ maxWidth: 420, wordBreak: "break-word" }}>{x.note || "-"}</td>
              </tr>
            ))}

            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={6} className="muted" style={{ padding: 16 }}>
                  Chưa có train job nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {loading && <div className="muted" style={{ marginTop: 12 }}>Đang tải...</div>}
      </div>
    </div>
  );
}