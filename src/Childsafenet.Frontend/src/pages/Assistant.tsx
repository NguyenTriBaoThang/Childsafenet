import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "../components/Button";
import { Input, Textarea } from "../components/Input";
import { Pill } from "../components/Pill";
import { assistantChatApi } from "../api/client";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  createdAt: string;
  blocks?: {
    conclusion?: string;
    reasons?: string[];
    recommendation?: string;
  };
};

function nowIso() {
  return new Date().toISOString();
}

function fmtTime(s: string) {
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

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

export default function Assistant() {
  const [searchParams] = useSearchParams();

  const initialUrl = searchParams.get("url") || "";
  const initialQuestion =
    searchParams.get("q") || "Tại sao website này bị chặn?";

  const [url, setUrl] = useState(initialUrl);
  const [message, setMessage] = useState(initialQuestion);
  const [childAge, setChildAge] = useState("10");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m1",
      role: "assistant",
      text:
        "Xin chào, tôi là ChildSafeNet Parent Safety Assistant. Tôi có thể giúp phụ huynh giải thích website có an toàn không, vì sao bị chặn, và nên block hay warn.",
      createdAt: nowIso(),
      blocks: {
        conclusion: "Sẵn sàng hỗ trợ phụ huynh.",
        reasons: [
          "Giải thích website bằng ngôn ngữ dễ hiểu.",
          "Hỗ trợ quyết định ALLOW / WARN / BLOCK.",
          "Đưa ra khuyến nghị phù hợp với trẻ em.",
        ],
        recommendation:
          "Bạn có thể nhập câu hỏi hoặc dán URL website để tôi phân tích.",
      },
    },
  ]);

  const suggestions = useMemo(
    () => [
      "Tại sao website này bị chặn?",
      "Website này có phù hợp với trẻ em không?",
      "Tôi nên block hay warn website này?",
      "Website này có dấu hiệu phishing không?",
      "Tôi nên giải thích với con thế nào về website này?",
    ],
    []
  );

  useEffect(() => {
    const qUrl = searchParams.get("url") || "";
    const qQuestion =
      searchParams.get("q") || "Tại sao website này bị chặn?";

    if (qUrl) setUrl(qUrl);
    if (qQuestion) setMessage(qQuestion);
  }, [searchParams]);

  const pushUserMessage = (text: string) => {
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      role: "user",
      text,
      createdAt: nowIso(),
    };
    setMessages((prev) => [...prev, userMsg]);
  };

  const pushAssistantMessage = (
    summary: string,
    blocks?: {
      conclusion?: string;
      reasons?: string[];
      recommendation?: string;
    }
  ) => {
    const assistantMsg: ChatMessage = {
      id: `a-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      role: "assistant",
      text: summary,
      createdAt: nowIso(),
      blocks,
    };
    setMessages((prev) => [...prev, assistantMsg]);
  };

  const sendMessage = async (text?: string) => {
    const finalText = (text ?? message).trim();
    if (!finalText) return;

    setError(null);
    pushUserMessage(finalText);
    setMessage("");
    setLoading(true);

    try {
      const res = await assistantChatApi({
        message: finalText,
        url: url.trim() || undefined,
        childAge: Number(childAge) || 10,
      });

      pushAssistantMessage(res.summary, {
        conclusion: res.blocks?.conclusion,
        reasons: res.blocks?.reasons ?? [],
        recommendation: res.blocks?.recommendation,
      });
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.detail ||
        e?.message ||
        "Không thể lấy phản hồi từ AI assistant.";

      setError(msg);

      pushAssistantMessage(
        "Hiện tại tôi chưa thể trả lời câu hỏi này vì có lỗi khi kết nối tới AI assistant.",
        {
          conclusion: "Chưa thể phân tích yêu cầu.",
          reasons: [msg],
          recommendation:
            "Hãy thử lại sau hoặc kiểm tra xem backend /api/assistant/chat đã chạy đúng chưa.",
        }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="pageHeader">
        <div>
          <h1>Parent Safety Assistant</h1>
          <p className="muted">
            Trợ lý AI hỗ trợ phụ huynh hiểu website trẻ đang truy cập, giải thích
            vì sao bị chặn hoặc cảnh báo, và gợi ý hành động phù hợp.
          </p>
        </div>
      </div>

      <div className="csnAssistantLayout" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="cardTitle">Ngữ cảnh cần phân tích</div>
          <div className="cardText">
            Phụ huynh có thể nhập URL và độ tuổi của trẻ để AI tư vấn sát với tình
            huống hơn.
          </div>

          <div className="csnAssistantFormGrid">
            <Input
              label="Website URL"
              value={url}
              onChange={(e: any) => setUrl(e.target.value)}
              placeholder="https://example.com"
            />

            <Input
              label="Độ tuổi của trẻ"
              type="number"
              min={1}
              max={18}
              value={childAge}
              onChange={(e: any) => setChildAge(e.target.value)}
              placeholder="10"
            />
          </div>

          {url.trim() && (
            <div className="csnAssistantSuggestBox" style={{ marginTop: 12 }}>
              <div className="csnAssistantSuggestTitle">Website đang xét</div>
              <div className="cardText">{getDomain(url)}</div>
            </div>
          )}

          <div className="csnAssistantSuggestBox">
            <div className="csnAssistantSuggestTitle">Câu hỏi gợi ý</div>
            <div className="csnAssistantChips">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="csnAssistantChip"
                  onClick={() => sendMessage(s)}
                  disabled={loading}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="card csnAssistantChatCard">
          <div className="csnAssistantChatHeader">
            <div>
              <div className="cardTitle">AI Chat Assistant</div>
              <div className="cardText">
                Trả lời theo hướng dễ hiểu cho phụ huynh, tập trung vào an toàn
                Internet cho trẻ em.
              </div>
            </div>
            <Pill text="Parent-focused AI" kind="ok" />
          </div>

          {error && (
            <div className="error" style={{ marginBottom: 12 }}>
              {error}
            </div>
          )}

          <div className="csnAssistantMessages">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`csnAssistantMsg ${m.role === "user" ? "user" : "assistant"}`}
              >
                <div className="csnAssistantMsgTop">
                  <div className="csnAssistantMsgRole">
                    {m.role === "user" ? "Phụ huynh" : "ChildSafeNet AI"}
                  </div>
                  <div className="csnAssistantMsgTime">{fmtTime(m.createdAt)}</div>
                </div>

                <div className="csnAssistantMsgText">{m.text}</div>

                {m.blocks && (
                  <div className="csnAssistantAnswerBlocks">
                    {m.blocks.conclusion && (
                      <div className="csnAssistantAnswerCard">
                        <div className="csnAssistantAnswerLabel">Kết luận</div>
                        <div className="csnAssistantAnswerValue">
                          {m.blocks.conclusion}
                        </div>
                      </div>
                    )}

                    {m.blocks.reasons && m.blocks.reasons.length > 0 && (
                      <div className="csnAssistantAnswerCard">
                        <div className="csnAssistantAnswerLabel">Lý do</div>
                        <ul className="csnAssistantList">
                          {m.blocks.reasons.map((r, idx) => (
                            <li key={idx}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {m.blocks.recommendation && (
                      <div className="csnAssistantAnswerCard">
                        <div className="csnAssistantAnswerLabel">
                          Khuyến nghị cho phụ huynh
                        </div>
                        <div className="csnAssistantAnswerValue">
                          {m.blocks.recommendation}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="csnAssistantMsg assistant">
                <div className="csnAssistantMsgTop">
                  <div className="csnAssistantMsgRole">ChildSafeNet AI</div>
                </div>
                <div className="csnAssistantTyping">
                  Đang phân tích và tạo tư vấn...
                </div>
              </div>
            )}
          </div>

          <div className="csnAssistantComposer">
            <Textarea
              label="Câu hỏi dành cho AI"
              rows={4}
              value={message}
              onChange={(e: any) => setMessage(e.target.value)}
              placeholder="Ví dụ: Tại sao website này bị chặn? Trẻ 10 tuổi có nên truy cập không?"
            />

            <div className="csnAssistantComposerActions">
              <Button
                variant="ghost"
                onClick={() => setMessage("")}
                disabled={loading}
              >
                Xóa
              </Button>
              <Button
                onClick={() => sendMessage()}
                disabled={loading || !message.trim()}
              >
                {loading ? "Đang gửi..." : "Gửi câu hỏi"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}