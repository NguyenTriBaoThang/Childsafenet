import { useEffect, useMemo, useState } from "react";
import { getSettingsApi, updateSettingsApi, type SettingsResponse } from "../api/client";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Pill } from "../components/Pill";
import { domainsToTextarea, parseDomainsFromTextarea } from "../utils/settingsFormat";

type Mode = "Strict" | "Balanced" | "Relaxed";

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function modeTitle(mode: Mode) {
  if (mode === "Strict") return "Bảo vệ cao";
  if (mode === "Relaxed") return "Thoải mái hơn";
  return "Cân bằng";
}

function modeHint(mode: Mode) {
  if (mode === "Strict") {
    return "Ưu tiên an toàn tối đa. Hệ thống sẽ chặn hoặc cảnh báo mạnh tay hơn.";
  }
  if (mode === "Relaxed") {
    return "Giảm bớt cảnh báo không cần thiết. Phù hợp khi trẻ lớn hơn và cần linh hoạt hơn.";
  }
  return "Cân bằng giữa an toàn và trải nghiệm sử dụng hằng ngày.";
}

function ageHint(age: number) {
  const safeAge = clamp(age, 1, 18);
  if (safeAge <= 6) return "Nên dùng mức bảo vệ cao vì trẻ còn nhỏ.";
  if (safeAge <= 12) return "Nên giữ mức bảo vệ cân bằng hoặc cao.";
  if (safeAge <= 15) return "Có thể chọn cân bằng và theo dõi thêm hành vi truy cập.";
  return "Có thể dùng mức cân bằng hoặc thoải mái hơn tùy nhu cầu gia đình.";
}

const defaultSettings: SettingsResponse = {
  childAge: 10,
  mode: "Balanced",
  whitelist: [],
  blacklist: [],
  blockAdult: true,
  blockGambling: true,
  blockPhishing: true,
  warnSuspicious: true,
};

export default function Settings() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [childAge, setChildAge] = useState<number>(10);
  const [mode, setMode] = useState<Mode>("Balanced");

  const [blockAdult, setBlockAdult] = useState(true);
  const [blockGambling, setBlockGambling] = useState(true);
  const [blockPhishing, setBlockPhishing] = useState(true);
  const [warnSuspicious, setWarnSuspicious] = useState(true);

  const [whitelistText, setWhitelistText] = useState("");
  const [blacklistText, setBlacklistText] = useState("");

  const wlCount = useMemo(() => parseDomainsFromTextarea(whitelistText).length, [whitelistText]);
  const blCount = useMemo(() => parseDomainsFromTextarea(blacklistText).length, [blacklistText]);

  const applyFromApi = (s: SettingsResponse) => {
    const safe = { ...defaultSettings, ...s };

    setChildAge(clamp(Number(safe.childAge ?? 10), 1, 18));
    setMode(((safe.mode as Mode) || "Balanced") as Mode);

    setBlockAdult(!!safe.blockAdult);
    setBlockGambling(!!safe.blockGambling);
    setBlockPhishing(!!safe.blockPhishing);
    setWarnSuspicious(!!safe.warnSuspicious);

    setWhitelistText(domainsToTextarea(safe.whitelist));
    setBlacklistText(domainsToTextarea(safe.blacklist));
  };

  const load = async () => {
    setLoading(true);
    setMsg(null);

    try {
      const s = await getSettingsApi();
      applyFromApi(s);
    } catch (e: any) {
      setMsg("❌ Không thể tải cài đặt: " + (e?.response?.data?.message || e?.message || String(e)));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async () => {
    setSaving(true);
    setMsg(null);

    try {
      const payload: SettingsResponse = {
        childAge: clamp(childAge, 1, 18),
        mode,
        whitelist: parseDomainsFromTextarea(whitelistText),
        blacklist: parseDomainsFromTextarea(blacklistText),
        blockAdult,
        blockGambling,
        blockPhishing,
        warnSuspicious,
      };

      const res = await updateSettingsApi(payload);
      applyFromApi(res);
      setMsg("✅ Đã lưu cài đặt bảo vệ thành công.");
    } catch (e: any) {
      setMsg("❌ Không thể lưu cài đặt: " + (e?.response?.data?.message || e?.message || String(e)));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <div className="pageHeader">
        <div>
          <h1>Family Safety Settings</h1>
          <p className="muted">
            Thiết lập mức bảo vệ phù hợp với con bạn, quản lý các nhóm nội dung cần chặn,
            và quyết định website nào luôn được phép hoặc luôn bị chặn.
          </p>
        </div>
      </div>

      {msg && (
        <div className="csnParentNotice" style={{ marginTop: 12 }}>
          {msg}
        </div>
      )}

      <div className="csnParentSection" style={{ marginTop: 16 }}>
        <Card>
          <div className="csnParentSectionHeader">
            <div>
              <h3>Bé bao nhiêu tuổi?</h3>
              <p className="muted">
                Độ tuổi giúp hệ thống điều chỉnh mức cảnh báo và bảo vệ phù hợp hơn.
              </p>
            </div>
            <Pill kind="ok">{clamp(childAge, 1, 18)} tuổi</Pill>
          </div>

          <div className="csnParentAgeRow">
            <Input
              type="number"
              value={childAge}
              onChange={(e: any) => setChildAge(Number(e.target.value))}
              min={1}
              max={18}
            />
          </div>

          <div className="csnParentHint">{ageHint(childAge)}</div>
        </Card>

        <Card>
          <div className="csnParentSectionHeader">
            <div>
              <h3>Chọn mức bảo vệ</h3>
              <p className="muted">
                Phụ huynh có thể chọn mức bảo vệ theo nhu cầu của gia đình.
              </p>
            </div>
            <Pill kind="warn">{modeTitle(mode)}</Pill>
          </div>

          <div className="csnModeCards">
            <button
              type="button"
              className={`csnModeCard ${mode === "Strict" ? "active" : ""}`}
              onClick={() => setMode("Strict")}
            >
              <div className="csnModeCardTitle">Bảo vệ cao</div>
              <div className="csnModeCardSub">Strict</div>
              <div className="csnModeCardDesc">
                Phù hợp với trẻ nhỏ hoặc khi phụ huynh muốn ưu tiên an toàn tối đa.
              </div>
            </button>

            <button
              type="button"
              className={`csnModeCard ${mode === "Balanced" ? "active" : ""}`}
              onClick={() => setMode("Balanced")}
            >
              <div className="csnModeCardTitle">Cân bằng</div>
              <div className="csnModeCardSub">Balanced</div>
              <div className="csnModeCardDesc">
                Phù hợp cho sử dụng hằng ngày, cân bằng giữa bảo vệ và trải nghiệm.
              </div>
            </button>

            <button
              type="button"
              className={`csnModeCard ${mode === "Relaxed" ? "active" : ""}`}
              onClick={() => setMode("Relaxed")}
            >
              <div className="csnModeCardTitle">Thoải mái hơn</div>
              <div className="csnModeCardSub">Relaxed</div>
              <div className="csnModeCardDesc">
                Giảm bớt cảnh báo không cần thiết, phù hợp với trẻ lớn hơn.
              </div>
            </button>
          </div>

          <div className="csnParentHint">{modeHint(mode)}</div>
        </Card>
      </div>

      <Card style={{ marginTop: 16 }}>
        <div className="csnParentSectionHeader">
          <div>
            <h3>Những gì cần chặn hoặc cảnh báo</h3>
            <p className="muted">
              Chọn các nhóm nội dung mà bạn muốn hệ thống tự động xử lý khi trẻ truy cập.
            </p>
          </div>
        </div>

        <div className="csnParentRulesGrid">
          <label className="csnParentRuleCard">
            <input
              type="checkbox"
              checked={blockAdult}
              onChange={(e) => setBlockAdult(e.target.checked)}
            />
            <div>
              <div className="csnParentRuleTitle">Chặn nội dung người lớn</div>
              <div className="muted">
                Chặn các website 18+, porn, xxx hoặc nội dung không phù hợp với trẻ.
              </div>
            </div>
          </label>

          <label className="csnParentRuleCard">
            <input
              type="checkbox"
              checked={blockGambling}
              onChange={(e) => setBlockGambling(e.target.checked)}
            />
            <div>
              <div className="csnParentRuleTitle">Chặn cờ bạc / cá cược</div>
              <div className="muted">
                Ngăn trẻ truy cập vào các website cá cược, betting hoặc cờ bạc trực tuyến.
              </div>
            </div>
          </label>

          <label className="csnParentRuleCard">
            <input
              type="checkbox"
              checked={blockPhishing}
              onChange={(e) => setBlockPhishing(e.target.checked)}
            />
            <div>
              <div className="csnParentRuleTitle">Chặn website giả mạo hoặc độc hại</div>
              <div className="muted">
                Chặn các website có dấu hiệu lừa đảo, phishing hoặc nguy cơ gây hại.
              </div>
            </div>
          </label>

          <label className="csnParentRuleCard">
            <input
              type="checkbox"
              checked={warnSuspicious}
              onChange={(e) => setWarnSuspicious(e.target.checked)}
            />
            <div>
              <div className="csnParentRuleTitle">Cảnh báo website đáng ngờ</div>
              <div className="muted">
                Hiển thị cảnh báo để phụ huynh hoặc trẻ biết website này cần cẩn trọng hơn.
              </div>
            </div>
          </label>
        </div>
      </Card>

      <div className="csnParentSection" style={{ marginTop: 16 }}>
        <Card>
          <div className="csnParentSectionHeader">
            <div>
              <h3>Luôn cho phép</h3>
              <p className="muted">
                Các website trong danh sách này sẽ luôn được cho phép, ngay cả khi AI nghi ngờ.
              </p>
            </div>
            <Pill kind="ok">{wlCount} website</Pill>
          </div>

          <textarea
            className="csnParentTextarea"
            placeholder={"Ví dụ:\ngoogle.com\nwikipedia.org\nhutech.edu.vn"}
            value={whitelistText}
            onChange={(e) => setWhitelistText(e.target.value)}
            rows={10}
          />

          <div className="csnParentSmallNote">
            Mỗi dòng nhập 1 domain. Ví dụ: <b>google.com</b>
          </div>
        </Card>

        <Card>
          <div className="csnParentSectionHeader">
            <div>
              <h3>Luôn chặn</h3>
              <p className="muted">
                Các website trong danh sách này sẽ luôn bị chặn, không phụ thuộc vào kết quả AI.
              </p>
            </div>
            <Pill kind="bad">{blCount} website</Pill>
          </div>

          <textarea
            className="csnParentTextarea"
            placeholder={"Ví dụ:\nbadsite.com\nevil-login.com"}
            value={blacklistText}
            onChange={(e) => setBlacklistText(e.target.value)}
            rows={10}
          />

          <div className="csnParentSmallNote">
            Mỗi dòng nhập 1 domain. Ví dụ: <b>badsite.com</b>
          </div>
        </Card>
      </div>

      <Card style={{ marginTop: 16 }}>
        <div className="csnParentSummaryTitle">Tóm tắt cấu hình hiện tại</div>
        <div className="csnParentSummaryGrid">
          <div className="csnParentSummaryItem">
            <div className="csnParentSummaryLabel">Độ tuổi của bé</div>
            <div className="csnParentSummaryValue">{clamp(childAge, 1, 18)} tuổi</div>
          </div>

          <div className="csnParentSummaryItem">
            <div className="csnParentSummaryLabel">Mức bảo vệ</div>
            <div className="csnParentSummaryValue">{modeTitle(mode)}</div>
          </div>

          <div className="csnParentSummaryItem">
            <div className="csnParentSummaryLabel">Website luôn cho phép</div>
            <div className="csnParentSummaryValue">{wlCount}</div>
          </div>

          <div className="csnParentSummaryItem">
            <div className="csnParentSummaryLabel">Website luôn chặn</div>
            <div className="csnParentSummaryValue">{blCount}</div>
          </div>
        </div>
      </Card>

      <div className="csnParentBottomActions">
        <Button variant="ghost" onClick={load} disabled={loading || saving}>
          {loading ? "Đang tải..." : "Làm mới"}
        </Button>

        <Button onClick={save} disabled={saving || loading}>
          {saving ? "Saving..." : "Lưu cài đặt"}
        </Button>
      </div>
    </div>
  );
}