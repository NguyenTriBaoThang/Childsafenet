import { useEffect, useMemo, useState } from "react";
import { Button } from "../../components/Button";
import { getTrainJobsApi, triggerTrainApi } from "../../api/client";
import type { TrainJob } from "../../api/client";

function fmtDate(s?: string) {
  if (!s) return "-";

  let value = s.trim();
  const hasTimezone = /z$|[+-]\d{2}:\d{2}$/i.test(value);
  if (!hasTimezone) value += "Z";

  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? s
    : d.toLocaleString("vi-VN", {
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

function normalizeStatus(status?: string) {
  const s = (status || "").trim().toUpperCase();
  return s || "UNKNOWN";
}

function statusKind(status?: string): "ok" | "warn" | "bad" {
  const s = normalizeStatus(status);
  if (["COMPLETED", "SUCCESS", "DONE"].includes(s)) return "ok";
  if (["FAILED", "ERROR", "CANCELLED"].includes(s)) return "bad";
  return "warn";
}

function statusText(status?: string) {
  const s = normalizeStatus(status);
  if (["QUEUED", "RUNNING", "COMPLETED", "FAILED", "SUCCESS", "DONE", "CANCELLED"].includes(s)) {
    return s;
  }
  return "UNKNOWN";
}

function shortNote(note?: string) {
  const raw = (note || "").trim();
  if (!raw) return "Không có ghi chú.";
  return raw.length > 120 ? `${raw.slice(0, 120).trim()}...` : raw;
}

type PipelineStepState = "done" | "current" | "pending" | "error";

function getPipelineState(status?: string) {
  const s = normalizeStatus(status);

  if (s === "QUEUED") {
    return {
      queued: "current" as PipelineStepState,
      running: "pending" as PipelineStepState,
      final: "pending" as PipelineStepState,
      finalLabel: "Completed / Failed",
    };
  }

  if (s === "RUNNING") {
    return {
      queued: "done" as PipelineStepState,
      running: "current" as PipelineStepState,
      final: "pending" as PipelineStepState,
      finalLabel: "Completed / Failed",
    };
  }

  if (["COMPLETED", "SUCCESS", "DONE"].includes(s)) {
    return {
      queued: "done" as PipelineStepState,
      running: "done" as PipelineStepState,
      final: "done" as PipelineStepState,
      finalLabel: "Completed",
    };
  }

  if (["FAILED", "ERROR", "CANCELLED"].includes(s)) {
    return {
      queued: "done" as PipelineStepState,
      running: "done" as PipelineStepState,
      final: "error" as PipelineStepState,
      finalLabel: "Failed",
    };
  }

  return {
    queued: "current" as PipelineStepState,
    running: "pending" as PipelineStepState,
    final: "pending" as PipelineStepState,
    finalLabel: "Completed / Failed",
  };
}

export default function AdminTrainJobs() {
  const [loading, setLoading] = useState(false);
  const [triggering, setTriggering] = useState(false);
  const [items, setItems] = useState<TrainJob[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setMsg(null);

    try {
      const data = await getTrainJobsApi();
      setItems(data);

      if (data.length > 0) {
        const firstId = String(data[0].id ?? "0");
        setActiveId((prev) => prev ?? firstId);
      } else {
        setActiveId(null);
      }
    } catch (e: any) {
      setMsg("Không tải được danh sách train jobs: " + (e?.message || String(e)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const trigger = async () => {
    setMsg(null);
    setTriggering(true);

    try {
      await triggerTrainApi();
      setMsg("✅ Đã tạo train job mới. Hệ thống sẽ xử lý ở background.");
      await load();
    } catch (e: any) {
      setMsg("Trigger train thất bại: " + (e?.message || String(e)));
    } finally {
      setTriggering(false);
    }
  };

  const stats = useMemo(() => {
    const total = items.length;
    const queued = items.filter((x) => normalizeStatus(x.status) === "QUEUED").length;
    const running = items.filter((x) => normalizeStatus(x.status) === "RUNNING").length;
    const completed = items.filter((x) =>
      ["COMPLETED", "SUCCESS", "DONE"].includes(normalizeStatus(x.status))
    ).length;
    const failed = items.filter((x) =>
      ["FAILED", "ERROR", "CANCELLED"].includes(normalizeStatus(x.status))
    ).length;

    return { total, queued, running, completed, failed };
  }, [items]);

  const activeItem = useMemo(() => {
    if (!items.length) return null;
    const found = items.find((x, idx) => String(x.id ?? idx) === activeId);
    return found || items[0];
  }, [items, activeId]);

  const pipeline = getPipelineState(activeItem?.status);

  return (
    <div className="page">
      <div className="pageHeader">
        <div>
          <h1>Admin Train Jobs</h1>
          <p className="muted">
            Theo dõi tiến trình huấn luyện model theo từng job, xem pipeline xử lý và kích hoạt train mới khi cần.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Button variant="ghost" onClick={load} disabled={loading || triggering}>
            {loading ? "Đang tải..." : "Refresh"}
          </Button>
          <Button onClick={trigger} disabled={triggering}>
            {triggering ? "Đang tạo job..." : "Trigger Train"}
          </Button>
        </div>
      </div>

      {msg && (
        <div className="alert" style={{ marginTop: 12 }}>
          {msg}
        </div>
      )}

      <div className="grid4" style={{ marginTop: 16 }}>
        <div className="card statCard">
          <div className="muted">Tổng jobs</div>
          <div className="statValue">{stats.total}</div>
        </div>
        <div className="card statCard">
          <div className="muted">Queued</div>
          <div className="statValue">{stats.queued}</div>
        </div>
        <div className="card statCard">
          <div className="muted">Running</div>
          <div className="statValue">{stats.running}</div>
        </div>
        <div className="card statCard">
          <div className="muted">Completed / Failed</div>
          <div className="statValue">
            {stats.completed} / {stats.failed}
          </div>
        </div>
      </div>

      <div className="csnTrainTimelineLayout" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="csnTrainListHeader">
            <div>
              <div className="cardTitle">Training Jobs</div>
              <div className="cardText">
                Chọn một job để xem pipeline timeline và chi tiết xử lý.
              </div>
            </div>
          </div>

          <div className="csnTrainJobList">
            {items.map((x, idx) => {
              const id = String(x.id ?? idx);
              const active = activeItem && String(activeItem.id ?? items.indexOf(activeItem)) === id;

              return (
                <button
                  key={id}
                  type="button"
                  className={`csnTrainJobItem ${active ? "active" : ""}`}
                  onClick={() => setActiveId(id)}
                >
                  <div className="csnTrainJobItemTop">
                    <span className={`pill ${statusKind(x.status)}`}>
                      {statusText(x.status)}
                    </span>
                    <div className="csnTrainJobVersion">{x.modelVersion || "-"}</div>
                  </div>

                  <div className="csnTrainJobMeta">
                    <div>
                      <span className="muted">Created:</span> {fmtDate(x.createdAt)}
                    </div>
                    <div>
                      <span className="muted">Started:</span> {fmtDate(x.startedAt)}
                    </div>
                    <div>
                      <span className="muted">Finished:</span> {fmtDate(x.finishedAt)}
                    </div>
                  </div>

                  <div className="csnTrainJobNote">{shortNote(x.note)}</div>
                </button>
              );
            })}

            {!loading && items.length === 0 && (
              <div className="muted">Chưa có train job nào.</div>
            )}
          </div>
        </div>

        <div className="card csnTrainPipelineCard">
          <div className="cardTitle">Pipeline Timeline</div>
          <div className="cardText" style={{ marginTop: 6 }}>
            Mỗi job đi qua các giai đoạn từ chờ xử lý đến hoàn tất hoặc thất bại.
          </div>

          {!activeItem && (
            <div className="muted" style={{ marginTop: 12 }}>
              Chưa có job nào để hiển thị.
            </div>
          )}

          {activeItem && (
            <div className="stack" style={{ marginTop: 14 }}>
              <div className="csnPipelineHeader">
                <div>
                  <div className="csnPipelineTitle">
                    Job status:{" "}
                    <span className={`pill ${statusKind(activeItem.status)}`}>
                      {statusText(activeItem.status)}
                    </span>
                  </div>
                  <div className="muted" style={{ marginTop: 6 }}>
                    Model version: <b>{activeItem.modelVersion || "-"}</b>
                  </div>
                </div>
              </div>

              <div className="csnPipelineTimeline">
                <div className={`csnPipelineStep ${pipeline.queued}`}>
                  <div className="csnPipelineDot" />
                  <div className="csnPipelineContent">
                    <div className="csnPipelineStepTitle">Queued</div>
                    <div className="csnPipelineStepText">
                      Job đã được tạo và đang chờ hệ thống bắt đầu xử lý.
                    </div>
                    <div className="csnPipelineStepMeta">
                      Created at: {fmtDate(activeItem.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="csnPipelineLine" />

                <div className={`csnPipelineStep ${pipeline.running}`}>
                  <div className="csnPipelineDot" />
                  <div className="csnPipelineContent">
                    <div className="csnPipelineStepTitle">Running</div>
                    <div className="csnPipelineStepText">
                      Pipeline train đang xử lý dữ liệu và huấn luyện model mới.
                    </div>
                    <div className="csnPipelineStepMeta">
                      Started at: {fmtDate(activeItem.startedAt)}
                    </div>
                  </div>
                </div>

                <div className="csnPipelineLine" />

                <div className={`csnPipelineStep ${pipeline.final}`}>
                  <div className="csnPipelineDot" />
                  <div className="csnPipelineContent">
                    <div className="csnPipelineStepTitle">{pipeline.finalLabel}</div>
                    <div className="csnPipelineStepText">
                      Job đã kết thúc. Nếu thành công, admin có thể dùng model version mới; nếu thất bại, cần kiểm tra lại pipeline hoặc dữ liệu.
                    </div>
                    <div className="csnPipelineStepMeta">
                      Finished at: {fmtDate(activeItem.finishedAt)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="csnTrainDetailGrid">
                <div className="csnTrainDetailBlock">
                  <div className="csnTrainDetailLabel">Created At</div>
                  <div className="csnTrainDetailValue">{fmtDate(activeItem.createdAt)}</div>
                </div>

                <div className="csnTrainDetailBlock">
                  <div className="csnTrainDetailLabel">Started At</div>
                  <div className="csnTrainDetailValue">{fmtDate(activeItem.startedAt)}</div>
                </div>

                <div className="csnTrainDetailBlock">
                  <div className="csnTrainDetailLabel">Finished At</div>
                  <div className="csnTrainDetailValue">{fmtDate(activeItem.finishedAt)}</div>
                </div>

                <div className="csnTrainDetailBlock">
                  <div className="csnTrainDetailLabel">Model Version</div>
                  <div className="csnTrainDetailValue">{activeItem.modelVersion || "-"}</div>
                </div>
              </div>

              <div className="csnTrainDetailBlock">
                <div className="csnTrainDetailLabel">Job Note</div>
                <div className="csnTrainDetailValue csnBreak">
                  {activeItem.note || "Không có ghi chú."}
                </div>
              </div>

              <div className="csnTrainDecisionHelp">
                <div className="csnTrainDecisionTitle">Gợi ý cho admin</div>
                <div className="cardText">
                  Nếu job đang ở trạng thái <b>QUEUED</b> hoặc <b>RUNNING</b>, hãy chờ hệ thống hoàn tất.
                  Nếu job ở trạng thái <b>FAILED</b>, cần kiểm tra pipeline train, dữ liệu đầu vào hoặc service AI.
                  Nếu job <b>COMPLETED</b>, có thể dùng model version mới cho bước đánh giá tiếp theo.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}