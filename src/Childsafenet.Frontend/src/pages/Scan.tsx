import { useEffect, useMemo, useState } from "react";
import { Card } from "../components/Card";
import { Input, Textarea } from "../components/Input";
import { Button } from "../components/Button";
import { Pill } from "../components/Pill";
import {
  scanApi,
  getSettingsApi,
  updateSettingsApi,
  type ScanResult,
  type SettingsResponse,
} from "../api/client";

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

function capitalizeFirst(s: string) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function getDecisionKind(action?: string) {
  if (action === "ALLOW") return "ok";
  if (action === "WARN") return "warn";
  return "bad";
}

function getDecisionTitle(action?: string, manuallyBlocked = false) {
  if (manuallyBlocked) return "Website này đang bị phụ huynh chặn thủ công";
  if (action === "ALLOW") return "Website này hiện được cho phép";
  if (action === "WARN") return "Website này cần phụ huynh xem lại";
  return "Website này đang bị chặn";
}

function getSafetyText(action?: string, manuallyBlocked = false) {
  if (manuallyBlocked) return "Đang chặn thủ công";
  if (action === "ALLOW") return "An toàn";
  if (action === "WARN") return "Cần thận trọng";
  return "Nguy hiểm / Không phù hợp";
}

function getSimpleCategory(res: ScanResult | null) {
  if (!res) return "-";

  const label = (res.label || "").toLowerCase();
  if (label.includes("adult") || label.includes("porn")) return "Nội dung người lớn";
  if (label.includes("gambling")) return "Cờ bạc / cá cược";
  if (label.includes("phishing")) return "Giả mạo / lừa đảo";
  if (label.includes("malware")) return "Nguy cơ độc hại";
  if (label.includes("benign")) return "Website phổ thông";
  if (label.includes("blacklist")) return "Chặn thủ công";
  if (label.includes("whitelist")) return "Cho phép thủ công";
  return "Chưa xác định rõ";
}

function getRiskText(risk?: string) {
  const r = (risk || "").toUpperCase();
  if (r === "HIGH") return "Cao";
  if (r === "MEDIUM") return "Trung bình";
  return "Thấp";
}

function buildWebsiteContentSummary(
  url: string,
  title: string,
  text: string,
  res: ScanResult | null
) {
  const domain = getDomain(url);
  const cleanTitle = (title || "").trim();
  const cleanText = (text || "").replace(/\s+/g, " ").trim();
  const category = getSimpleCategory(res);

  if (cleanText) {
    const shortText =
      cleanText.length > 220 ? `${cleanText.slice(0, 220).trim()}...` : cleanText;

    if (cleanTitle) {
      return `Đây là trang website "${cleanTitle}". Nội dung chính hiển thị: ${shortText}`;
    }

    return `Đây là website ${domain}. Nội dung chính hiển thị: ${shortText}`;
  }

  if (cleanTitle) {
    return `Đây là trang website "${cleanTitle}" thuộc tên miền ${domain}. Loại nội dung được hệ thống nhận diện: ${category.toLowerCase()}.`;
  }

  return `Đây là website thuộc tên miền ${domain}. Hệ thống hiện nhận diện đây là nhóm nội dung: ${category.toLowerCase()}.`;
}

function getParentExplanation(
  res: ScanResult | null,
  manuallyBlocked: boolean,
  contentSummary: string
) {
  if (!res) return "";

  if (manuallyBlocked) {
    return `Website này đang nằm trong danh sách chặn thủ công của phụ huynh. ${contentSummary}`;
  }

  if (res.action === "BLOCK") {
    return `Hệ thống đánh giá website này có rủi ro hoặc không phù hợp với trẻ, vì vậy đã chặn truy cập. ${contentSummary}`;
  }

  if (res.action === "WARN") {
    return `Hệ thống thấy website này có dấu hiệu cần thận trọng. Phụ huynh nên xem nội dung trước khi cho phép trẻ truy cập. ${contentSummary}`;
  }

  return `Hệ thống chưa phát hiện rủi ro mạnh ở website này, nên hiện tại website được cho phép truy cập. ${contentSummary}`;
}

export default function Scan() {
  const [url, setUrl] = useState("https://www.wikipedia.org/");
  const [title, setTitle] = useState("Wikipedia");
  const [text, setText] = useState("Wikipedia is a free online encyclopedia.");

  const [loading, setLoading] = useState(false);
  const [savingBlock, setSavingBlock] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [res, setRes] = useState<ScanResult | null>(null);
  const [settings, setSettings] = useState<SettingsResponse | null>(null);

  const domain = useMemo(() => getDomain(url), [url]);

  const manuallyBlocked = useMemo(() => {
    const blacklist = (settings?.blacklist ?? []).map((x) => getDomain(x));
    return blacklist.includes(domain);
  }, [settings, domain]);

  const websiteContentSummary = useMemo(() => {
    return buildWebsiteContentSummary(url, title, text, res);
  }, [url, title, text, res]);

  const parentExplanation = useMemo(() => {
    return getParentExplanation(res, manuallyBlocked, websiteContentSummary);
  }, [res, manuallyBlocked, websiteContentSummary]);

  const loadSettings = async () => {
    try {
      const data = await getSettingsApi();
      setSettings(data);
    } catch (e) {
      console.error("load settings failed", e);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const run = async () => {
    if (!url.trim()) {
      alert("Nhập URL trước nhé");
      return;
    }

    setLoading(true);
    setError(null);
    setNotice(null);
    setRes(null);

    try {
      const data = await scanApi({
        url: url.trim(),
        title,
        text,
        source: "Web",
      });
      setRes(data);
    } catch (e: any) {
      setError(
        e?.response?.data?.message ??
          e?.response?.data?.detail?.message ??
          "Phân tích website thất bại"
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleManualBlock = async () => {
    if (!settings || !domain) return;

    setSavingBlock(true);
    setError(null);
    setNotice(null);

    try {
      const currentBlacklist = [
        ...new Set((settings.blacklist ?? []).map((x) => getDomain(x))),
      ];
      const currentWhitelist = [
        ...new Set((settings.whitelist ?? []).map((x) => getDomain(x))),
      ];

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

      setNotice(
        manuallyBlocked
          ? `Đã bỏ chặn ${domain}. Website này đã được chuyển sang danh sách cho phép.`
          : `Đã chặn ${domain}. Website này đã được thêm vào danh sách chặn.`
      );
    } catch (e: any) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "Không thể cập nhật danh sách chặn"
      );
    } finally {
      setSavingBlock(false);
    }
  };

  return (
    <div className="stack">
      <div className="rowBetween">
        <div>
          <h2 className="h2">Kiểm tra độ an toàn của website</h2>
          <div className="muted">
            Phụ huynh có thể nhập một website để xem mức độ an toàn, nội dung trang
            web, lý do cho phép hoặc chặn, và quản lý chặn thủ công.
          </div>
        </div>
      </div>

      <div className="grid2">
        <Card>
          <div className="cardTitle">Nhập thông tin website</div>
          <div className="cardText">
            Điền URL và, nếu có, thêm tiêu đề hoặc mô tả ngắn để hệ thống phân tích
            rõ hơn nội dung website.
          </div>

          <Input
            label="URL website"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
          />

          <Input
            label="Tiêu đề trang (không bắt buộc)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ví dụ: Trường Đại học Công nghệ TP. Hồ Chí Minh"
          />

          <Textarea
            label="Mô tả hoặc nội dung trang (không bắt buộc)"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={7}
            placeholder="Ví dụ: Đây là trang website của Trường Đại học Công nghệ TP. Hồ Chí Minh."
          />

          <Button onClick={run} disabled={loading} style={{ marginTop: 10 }}>
            {loading ? "Đang phân tích..." : "Phân tích website"}
          </Button>

          {error && (
            <div className="error" style={{ marginTop: 10 }}>
              {error}
            </div>
          )}
        </Card>

        <Card>
          <div className="cardTitle">Kết quả dành cho phụ huynh</div>

          {!res && (
            <div className="muted" style={{ marginTop: 10 }}>
              Chưa có kết quả. Hãy nhập website và bấm “Phân tích website”.
            </div>
          )}

          {res && (
            <div className="stack" style={{ marginTop: 10 }}>
              <div className="csnScanHero">
                <div>
                  <div className="csnScanTitle">
                    {getDecisionTitle(res.action, manuallyBlocked)}
                  </div>
                  <div className="csnScanDomain">{domain || "-"}</div>
                </div>

                <Pill
                  text={res.action}
                  kind={getDecisionKind(res.action) as "ok" | "warn" | "bad"}
                />
              </div>

              <div className="csnScanInfoGrid">
                <div className="csnScanInfoItem">
                  <div className="csnScanInfoLabel">Mức độ an toàn</div>
                  <div className="csnScanInfoValue">
                    {getSafetyText(res.action, manuallyBlocked)}
                  </div>
                </div>

                <div className="csnScanInfoItem">
                  <div className="csnScanInfoLabel">Mức rủi ro</div>
                  <div className="csnScanInfoValue">
                    {getRiskText(res.riskLevel)}
                  </div>
                </div>

                <div className="csnScanInfoItem">
                  <div className="csnScanInfoLabel">Loại nội dung</div>
                  <div className="csnScanInfoValue">
                    {getSimpleCategory(res)}
                  </div>
                </div>

                <div className="csnScanInfoItem">
                  <div className="csnScanInfoLabel">Trạng thái chặn thủ công</div>
                  <div className="csnScanInfoValue">
                    {manuallyBlocked ? "Đang chặn" : "Chưa chặn"}
                  </div>
                </div>
              </div>

              <div className="csnScanExplain">
                <div className="csnScanExplainTitle">Nội dung trang web</div>
                <div className="csnScanExplainText">{websiteContentSummary}</div>
              </div>

              <div className="csnScanExplain">
                <div className="csnScanExplainTitle">Đánh giá dành cho phụ huynh</div>
                <div className="csnScanExplainText">{parentExplanation}</div>
              </div>

              {(res.explanation || []).length > 0 && (
                <div className="csnScanExplain">
                  <div className="csnScanExplainTitle">Dấu hiệu hệ thống phát hiện</div>
                  <ul className="csnScanBullets">
                    {(res.explanation || []).map((x, i) => (
                      <li key={i}>{capitalizeFirst(x)}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="csnCheckRow">
                <input
                  type="checkbox"
                  checked={manuallyBlocked}
                  disabled={savingBlock}
                  onChange={toggleManualBlock}
                />
                <div>
                  <div className="csnCheckTitle">
                    {manuallyBlocked
                      ? "Bỏ chặn website này"
                      : "Chặn website này"}
                  </div>
                  <div className="muted">
                    Phụ huynh có thể tự quyết định chặn hoặc cho phép website này,
                    không phụ thuộc hoàn toàn vào kết quả phân tích AI.
                  </div>
                </div>
              </div>

              {notice && <div className="csnLogsNotice ok">{notice}</div>}

              <div className="csnScanMiniDetails">
                <div className="csnScanMiniTitle">AI details</div>
                <div className="csnScanMiniGrid">
                  <div>
                    <span className="muted">AI label:</span>{" "}
                    <span>{res.label || "-"}</span>
                  </div>
                  <div>
                    <span className="muted">Score:</span>{" "}
                    <span>
                      {typeof res.score === "number" ? res.score.toFixed(4) : "-"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}