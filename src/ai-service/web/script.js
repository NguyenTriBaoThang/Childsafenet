const API = "http://localhost:8000/predict";

function pillClass(action) {
  if (action === "ALLOW") return "pill ok";
  if (action === "WARN") return "pill warn";
  return "pill bad";
}

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function safeReadJson(res) {
  // Đọc text trước, rồi parse JSON nếu được
  const text = await res.text();
  try {
    return { ok: res.ok, status: res.status, data: JSON.parse(text), raw: text };
  } catch (e) {
    return { ok: res.ok, status: res.status, data: null, raw: text, parseError: String(e) };
  }
}

document.getElementById("btn").addEventListener("click", async () => {
  const url = document.getElementById("url").value.trim();
  const title = document.getElementById("title").value.trim();
  const text = document.getElementById("text").value.trim();
  const child_age = Number(document.getElementById("age").value);

  if (!url) {
    alert("Nhập URL trước nhé");
    return;
  }

  const payload = { url, title, text, child_age };

  const summaryEl = document.getElementById("summary");
  const rawEl = document.getElementById("raw");

  summaryEl.innerHTML = "Đang phân tích...";
  rawEl.textContent = "{}";

  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await safeReadJson(res);

    // Nếu backend trả không phải JSON (HTML/text)
    if (!result.data) {
      summaryEl.innerHTML = `
        <div class="pill bad">ERROR</div>
        <div style="margin-top:10px;">
          Backend không trả JSON (status: ${result.status}).<br/>
          Hãy xem terminal uvicorn để biết traceback.
        </div>
      `;
      rawEl.textContent = result.raw || "(empty)";
      return;
    }

    // JSON hợp lệ
    rawEl.textContent = JSON.stringify(result.data, null, 2);

    // Nếu status lỗi, FastAPI thường trả { detail: ... }
    if (!result.ok) {
      const detail = result.data?.detail ?? result.data;
      summaryEl.innerHTML = `
        <div class="pill bad">ERROR ${result.status}</div>
        <div style="margin-top:10px;">
          <b>Backend error:</b>
          <pre style="white-space:pre-wrap;margin-top:8px;">${escapeHtml(JSON.stringify(detail, null, 2))}</pre>
        </div>
      `;
      return;
    }

    // Thành công: hiển thị predict result
    const data = result.data;
    const cls = pillClass(data.action);

    const explain = (data.explanation || [])
      .map(x => `<li>${escapeHtml(x)}</li>`)
      .join("");

    summaryEl.innerHTML = `
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
        <span class="${cls}">${escapeHtml(data.action)}</span>
        <span class="pill">${escapeHtml(data.risk_level)}</span>
        <span class="pill">label: ${escapeHtml(data.label)}</span>
        <span class="pill">score: ${escapeHtml(data.score)}</span>
        <span class="pill">latency: ${escapeHtml(data.meta?.latency_ms ?? "-")}ms</span>
      </div>
      <ul style="margin-top:10px;">${explain || "<li>(no explanation)</li>"}</ul>
    `;
  } catch (e) {
    summaryEl.innerHTML = `
      <div class="pill bad">NETWORK ERROR</div>
      <div style="margin-top:10px;">${escapeHtml(String(e))}</div>
    `;
  }
});
