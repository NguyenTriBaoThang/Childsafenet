# Chrome Extension

## Purpose

- Scan every visited website
- Send URL to API
- Block or warn based on AI result

---

## Pair Flow

1. User logs into website
2. Click "Pair Extension"
3. Token sent via window.postMessage
4. Extension stores token
5. Extension starts scanning

---

## Block Flow

If result.action === "BLOCK":
→ Redirect to block.html

---

## Toggle Mode

User can:
- Enable Extension
- Disable Extension