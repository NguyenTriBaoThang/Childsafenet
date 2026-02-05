import React, { useEffect, useMemo, useState } from "react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Pill } from "../components/Pill";
import { getLogsApi } from "../api/client";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await getLogsApi(1, 10);
      setLogs(res.items || []);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Cannot load logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const stats = useMemo(() => {
    return logs.reduce(
      (acc, x) => {
        acc.total += 1;
        if (x.action === "BLOCK") acc.block += 1;
        else if (x.action === "WARN") acc.warn += 1;
        else acc.allow += 1;
        return acc;
      },
      { total: 0, block: 0, warn: 0, allow: 0 }
    );
  }, [logs]);

  return (
    <div className="stack">
      <div className="rowBetween">
        <div>
          <h2 className="h2">Dashboard</h2>
          <div className="muted">Tổng quan hoạt động quét gần đây của tài khoản.</div>
        </div>
        <div className="row">
          <Link to="/scan"><Button>Manual Scan</Button></Link>
          <Button variant="ghost" onClick={load} disabled={loading}>{loading ? "Loading..." : "Refresh"}</Button>
        </div>
      </div>

      <div className="grid4">
        <StatCard title="Total" value={stats.total} />
        <StatCard title="BLOCK" value={stats.block} kind="bad" />
        <StatCard title="WARN" value={stats.warn} kind="warn" />
        <StatCard title="ALLOW" value={stats.allow} kind="ok" />
      </div>

      <Card>
        <div className="rowBetween">
          <div>
            <div className="cardTitle">Recent logs</div>
            <div className="muted">Hiển thị 10 bản ghi mới nhất.</div>
          </div>
        </div>

        {error && <div className="error" style={{ marginTop: 10 }}>{error}</div>}

        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr>
                <th>Time</th>
                <th>URL</th>
                <th>Label</th>
                <th>Score</th>
                <th>Action</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {!loading && logs.length === 0 && (
                <tr><td colSpan={6} className="muted">Chưa có logs. Hãy thử Manual Scan.</td></tr>
              )}
              {logs.map((x) => (
                <tr key={x.id}>
                  <td>{new Date(x.createdAt).toLocaleString()}</td>
                  <td><code className="code">{x.url}</code></td>
                  <td>{x.label}</td>
                  <td>{Number(x.score).toFixed(3)}</td>
                  <td>
                    <Pill
                      text={x.action}
                      kind={x.action === "ALLOW" ? "ok" : x.action === "WARN" ? "warn" : "bad"}
                    />
                  </td>
                  <td>{x.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function StatCard({ title, value, kind = "neutral" }: { title: string; value: number; kind?: "ok" | "warn" | "bad" | "neutral" }) {
  return (
    <Card className="statCard">
      <div className="muted" style={{ fontSize: 12 }}>{title}</div>
      <div className="statValue">{value}</div>
      <div style={{ marginTop: 8 }}><Pill text={title} kind={kind} /></div>
    </Card>
  );
}