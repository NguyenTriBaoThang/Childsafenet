import React, { useEffect, useMemo, useState } from "react";
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

function modeHint(mode: Mode) {
  if (mode === "Strict") return "Chặn mạnh: ưu tiên an toàn, có thể nhiều WARN/BLOCK hơn.";
  if (mode === "Relaxed") return "Nới lỏng: ít cảnh báo hơn, vẫn chặn Adult/Gambling/Phishing nếu bật.";
  return "Cân bằng: phù hợp demo, ít false-positive hơn Strict.";
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

  // form state
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
      setMsg("❌ Load settings failed: " + (e?.response?.data?.message || e?.message || String(e)));
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
      setMsg("✅ Đã lưu cài đặt thành công.");
    } catch (e: any) {
      setMsg("❌ Save settings failed: " + (e?.response?.data?.message || e?.message || String(e)));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <div className="pageHeader">
        <div>
          <h1>Settings</h1>
          <p className="muted">Cá nhân hoá bảo vệ theo gia đình (Age • Mode • Rules • Whitelist/Blacklist).</p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Button variant="ghost" onClick={load} disabled={loading || saving}>
            Refresh
          </Button>
          <Button onClick={save} disabled={saving || loading}>
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>

      {msg && (
        <div className="alert" style={{ marginTop: 12 }}>
          {msg}
        </div>
      )}

      {/* Basic */}
      <div className="csnGrid csnGrid-2" style={{ marginTop: 16 }}>
        <Card>
          <h3>Child Age</h3>
          <p className="muted" style={{ marginTop: 6 }}>
            Dùng để cá nhân hoá mức cảnh báo trong tương lai.
          </p>

          <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 12 }}>
            <Input
              type="number"
              value={childAge}
              onChange={(e: any) => setChildAge(Number(e.target.value))}
              min={1}
              max={18}
            />
            <Pill kind="ok">{clamp(childAge, 1, 18)} tuổi</Pill>
          </div>
        </Card>

        <Card>
          <h3>Mode</h3>
          <p className="muted" style={{ marginTop: 6 }}>
            {modeHint(mode)}
          </p>

          <div className="csnSegRow" style={{ marginTop: 12 }}>
            <button className={mode === "Strict" ? "csnSeg active" : "csnSeg"} onClick={() => setMode("Strict")} type="button">
              Strict
            </button>
            <button
              className={mode === "Balanced" ? "csnSeg active" : "csnSeg"}
              onClick={() => setMode("Balanced")}
              type="button"
            >
              Balanced
            </button>
            <button
              className={mode === "Relaxed" ? "csnSeg active" : "csnSeg"}
              onClick={() => setMode("Relaxed")}
              type="button"
            >
              Relaxed
            </button>
          </div>

          <div className="muted" style={{ marginTop: 10, fontSize: 13 }}>
            Tip: Nếu model hay block nhầm Google → giữ <b>Balanced</b> + thêm vào Whitelist.
          </div>
        </Card>
      </div>

      {/* Rules */}
      <Card style={{ marginTop: 16 }}>
        <h3>Rule Toggles</h3>
        <p className="muted">Bật/tắt các nhóm chặn chính khi scan.</p>

        <div className="csnGrid csnGrid-2" style={{ marginTop: 12 }}>
          <label className="csnCheckRow">
            <input type="checkbox" checked={blockAdult} onChange={(e) => setBlockAdult(e.target.checked)} />
            <div>
              <div className="csnCheckTitle">Block Adult</div>
              <div className="muted">Chặn nội dung 18+ / porn / xxx</div>
            </div>
          </label>

          <label className="csnCheckRow">
            <input type="checkbox" checked={blockGambling} onChange={(e) => setBlockGambling(e.target.checked)} />
            <div>
              <div className="csnCheckTitle">Block Gambling</div>
              <div className="muted">Chặn web cờ bạc / betting</div>
            </div>
          </label>

          <label className="csnCheckRow">
            <input type="checkbox" checked={blockPhishing} onChange={(e) => setBlockPhishing(e.target.checked)} />
            <div>
              <div className="csnCheckTitle">Block Phishing</div>
              <div className="muted">Chặn phishing/malware nếu model báo</div>
            </div>
          </label>

          <label className="csnCheckRow">
            <input type="checkbox" checked={warnSuspicious} onChange={(e) => setWarnSuspicious(e.target.checked)} />
            <div>
              <div className="csnCheckTitle">Warn Suspicious</div>
              <div className="muted">Hiển thị cảnh báo nếu nghi ngờ</div>
            </div>
          </label>
        </div>
      </Card>

      {/* Lists */}
      <div className="csnGrid csnGrid-2" style={{ marginTop: 16 }}>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
            <h3>Whitelist Domains</h3>
            <Pill kind="ok">{wlCount} domains</Pill>
          </div>
          <p className="muted">Luôn ALLOW (ưu tiên hơn model). Mỗi dòng 1 domain.</p>

          <textarea
            className="csnTextarea"
            placeholder={"VD:\ngoogle.com\nwikipedia.org\ngithub.com"}
            value={whitelistText}
            onChange={(e) => setWhitelistText(e.target.value)}
            rows={10}
            style={{ marginTop: 12 }}
          />
        </Card>

        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
            <h3>Blacklist Domains</h3>
            <Pill kind="bad">{blCount} domains</Pill>
          </div>
          <p className="muted">Luôn BLOCK (ưu tiên hơn model). Mỗi dòng 1 domain.</p>

          <textarea
            className="csnTextarea"
            placeholder={"VD:\nbadsite.com\nevil-login.com"}
            value={blacklistText}
            onChange={(e) => setBlacklistText(e.target.value)}
            rows={10}
            style={{ marginTop: 12 }}
          />
        </Card>
      </div>

      <div className="muted" style={{ marginTop: 16, fontSize: 13 }}>
        Dataset sẽ thu thập URL khi scan → admin duyệt → train định kỳ. Settings này chỉ điều khiển policy cho user.
      </div>
    </div>
  );
}