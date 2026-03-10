function q(name) {
  const u = new URL(location.href);
  return u.searchParams.get(name) || "";
}

// Escape HTML để tránh XSS
function escapeHtml(str) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// Lấy dữ liệu từ query
const url = q("url");
const label = q("label");
const score = q("score");
const risk = q("risk");

// Render thông tin (đã escape)
document.getElementById("info").innerHTML = `
  URL: <code>${escapeHtml(url)}</code><br/>
  Label: <b>${escapeHtml(label)}</b> • Risk: <b>${escapeHtml(risk)}</b> • Score: <b>${escapeHtml(score)}</b>
`;

// Validate URL chỉ cho http/https
let safeUrl = "about:blank";

try {
  const parsed = new URL(url);

  if (parsed.protocol === "http:" || parsed.protocol === "https:") {
    safeUrl = parsed.href;
  }
} catch (e) {
  console.warn("Invalid URL:", url);
}

// Setup nút Open Anyway
const openAnyway = document.getElementById("openAnyway");
openAnyway.href = safeUrl;
openAnyway.target = "_self";
