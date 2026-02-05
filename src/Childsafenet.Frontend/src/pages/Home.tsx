import React from "react";
import { Link } from "react-router-dom";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Pill } from "../components/Pill";

export default function Home() {
  return (
    <div className="stack">
      <section className="hero">
        <div className="heroLeft">
          <div className="kicker">
            <Pill text="AI Safety" kind="neutral" />
            <Pill text="Chrome Extension" kind="neutral" />
            <Pill text="Parent Dashboard" kind="neutral" />
          </div>

          <h1 className="heroTitle">
            ChildSafeNet
            <span className="grad"> – Giám sát & cảnh báo rủi ro Internet cho trẻ em</span>
          </h1>

          <p className="heroDesc">
            Hệ thống kết hợp <b>AI Classification</b> + <b>Chính sách phụ huynh</b> để phát hiện URL nguy hiểm
            (phishing / nội dung không phù hợp) và đưa ra hành động <b>ALLOW / WARN / BLOCK</b>.
          </p>

          <div className="heroActions">
            <Link to="/login"><Button>Đăng nhập để dùng thử</Button></Link>
            <Link to="/scan"><Button variant="ghost">Quét URL thủ công</Button></Link>
          </div>

          <div className="miniNote">
            Tip: Nếu bạn chưa có tài khoản, hãy tạo bằng Swagger API: <code>/api/auth/register</code>.
          </div>
        </div>

        <div className="heroRight">
          <Card className="heroCard">
            <div className="heroCardTitle">Luồng hoạt động</div>
            <ol className="flow">
              <li>Extension/Web lấy URL + nội dung</li>
              <li>Gửi về API (.NET) để xác thực & lưu log</li>
              <li>API gọi AI FastAPI để dự đoán nhãn & score</li>
              <li>Policy áp dụng theo settings phụ huynh</li>
              <li>Trả action: ALLOW/WARN/BLOCK</li>
            </ol>
            <div className="badges">
              <span className="badge">JWT Auth</span>
              <span className="badge">SQL Server Logs</span>
              <span className="badge">Explain (Top signals)</span>
            </div>
          </Card>
        </div>
      </section>

      <section className="grid3">
        <Card>
          <div className="cardTitle">Manual Scan</div>
          <div className="cardText">Nhập URL để AI phân tích và hiển thị kết quả + giải thích.</div>
        </Card>
        <Card>
          <div className="cardTitle">Dashboard</div>
          <div className="cardText">Thống kê nhanh & lịch sử giám sát theo từng phụ huynh.</div>
        </Card>
        <Card>
          <div className="cardTitle">Extension Ready</div>
          <div className="cardText">Có thể chặn trực tiếp khi action = BLOCK (demo local/hosting).</div>
        </Card>
      </section>
    </div>
  );
}