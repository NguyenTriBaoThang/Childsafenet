import React, { useState } from "react";
import { Card } from "../components/Card";
import { Input, Textarea } from "../components/Input";
import { Button } from "../components/Button";
import { Pill } from "../components/Pill";
import { scanApi, type ScanResult } from "../api/client";

export default function Scan() {
  const [url, setUrl] = useState("https://www.wikipedia.org/");
  const [title, setTitle] = useState("Wikipedia");
  const [text, setText] = useState("Wikipedia is a free online encyclopedia.");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [res, setRes] = useState<ScanResult | null>(null);

  const run = async () => {
    if (!url.trim()) return alert("Nhập URL trước nhé");
    setLoading(true);
    setError(null);
    setRes(null);
    try {
      const data = await scanApi({ url: url.trim(), title, text, source: "Web" });
      setRes(data);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.response?.data?.detail?.message ?? "Scan failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stack">
      <div className="rowBetween">
        <div>
          <h2 className="h2">Manual Scan</h2>
          <div className="muted">Nhập URL để AI phân tích và lưu log vào SQL Server.</div>
        </div>
      </div>

      <div className="grid2">
        <Card>
          <Input label="URL" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" />
          <Input label="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea label="Text / HTML text (optional)" value={text} onChange={(e) => setText(e.target.value)} rows={7} />

          <Button onClick={run} disabled={loading} style={{ marginTop: 10 }}>
            {loading ? "Scanning..." : "Phân tích"}
          </Button>

          {error && <div className="error" style={{ marginTop: 10 }}>{error}</div>}
        </Card>

        <Card>
          <div className="cardTitle">Kết quả</div>
          {!res && <div className="muted" style={{ marginTop: 10 }}>Chưa chạy...</div>}

          {res && (
            <>
              <div className="row" style={{ flexWrap: "wrap", marginTop: 10 }}>
                <Pill text={res.action} kind={res.action === "ALLOW" ? "ok" : res.action === "WARN" ? "warn" : "bad"} />
                <Pill text={res.riskLevel} />
                <Pill text={`label: ${res.label}`} />
                <Pill text={`score: ${res.score}`} />
              </div>

              <ul style={{ marginTop: 12 }}>
                {(res.explanation || []).map((x, i) => <li key={i}>{x}</li>)}
              </ul>

              <div style={{ marginTop: 12 }}>
                <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>Raw JSON</div>
                <pre className="pre">{JSON.stringify(res, null, 2)}</pre>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}