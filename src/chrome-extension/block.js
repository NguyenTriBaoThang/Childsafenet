// Hàm hỗ trợ lấy query parameter từ URL hiện tại
function q(name) {
  const u = new URL(location.href);
  return u.searchParams.get(name) || "";
}

// Escape HTML để ngăn chặn lỗ hổng XSS (Cross-Site Scripting)
function escapeHtml(str) {
  if (!str) return "";
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// 1. Lấy dữ liệu từ thanh địa chỉ (query params)
const url = q("url");
const label = q("label");
const score = q("score");
const risk = q("risk");

// 2. Render thông tin cảnh báo an toàn ra HTML (đã được escape hoàn toàn)
const infoDiv = document.getElementById("info");
if (infoDiv) {
  infoDiv.innerHTML = `
    URL: <code>${escapeHtml(url)}</code><br/>
    Label: <b>${escapeHtml(label)}</b> &bull; Risk: <b>${escapeHtml(risk)}</b> &bull; Score: <b>${escapeHtml(score)}</b>
  `;
}

// 3. Xử lý nút "Tiếp tục truy cập" (Open Anyway) một cách bảo mật
let safeUrl = "about:blank";

// Try-catch để bắt trường hợp URL rác hoặc cố tình hack
try {
  if (url) {
    const parsed = new URL(url);
    // Chỉ cho phép giao thức http và https (Chặn các mã độc dạng javascript:, data:, file:...)
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      safeUrl = parsed.href;
    }
  }
} catch (e) {
  console.warn("ChildSafeNet Block Page - Invalid URL Detected:", url);
}

// 4. Gắn URL an toàn vào nút bấm
const openAnywayBtn = document.getElementById("openAnyway");
if (openAnywayBtn) {
  openAnywayBtn.href = safeUrl;
  openAnywayBtn.target = "_self"; // Mở đè lên tab hiện tại
}

// (Tùy chọn) 5. Xử lý nút "Quay lại an toàn" (Go Back) nếu bạn có nút này trên block.html
const goBackBtn = document.getElementById("goBack");
if (goBackBtn) {
  goBackBtn.addEventListener("click", (e) => {
    e.preventDefault();
    // Thử quay lại trang trước, nếu không có lịch sử thì đóng tab hoặc về trang chủ google
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "https://www.google.com";
    }
  });
}
