export function parseDomainsFromTextarea(text: string): string[] {
  const lines = (text || "")
    .split(/\r?\n/)
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean);

  // normalize: bỏ http(s)://, bỏ path, chỉ lấy host nếu user dán URL
  const cleaned = lines.map((x) => {
    let s = x;
    s = s.replace(/^https?:\/\//, "");
    s = s.replace(/^www\./, "");
    s = s.split("/")[0];
    s = s.split("?")[0];
    s = s.split("#")[0];
    return s.trim();
  });

  // unique
  return Array.from(new Set(cleaned)).filter(Boolean);
}

export function domainsToTextarea(domains?: string[] | null): string {
  if (!domains || domains.length === 0) return "";
  return domains.map((d) => (d || "").trim()).filter(Boolean).join("\n");
}