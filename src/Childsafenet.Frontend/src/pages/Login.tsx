import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import AlreadyLoggedIn from "../components/AlreadyLoggedIn";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Pill } from "../components/Pill";

export default function Login() {
  const nav = useNavigate();
  const auth = useAuth();
  const { isAuthed } = useAuth();

  const [email, setEmail] = useState("parent1@test.com");
  const [password, setPassword] = useState("123456");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (isAuthed) {
    return <AlreadyLoggedIn />;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const role = await auth.login({ email, password });
      if (role === "admin") nav("/admin/dataset");
      else nav("/dashboard");
    } catch (ex: any) {
      setErr(ex?.response?.data?.message || ex?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="csnUltraAuthPage">
      <div className="csnUltraAuthGlow csnUltraAuthGlow1" />
      <div className="csnUltraAuthGlow csnUltraAuthGlow2" />

      <div className="csnUltraAuthShell">
        <section className="csnUltraAuthBrand">
          <div className="kicker">
            <Pill text="Parent Access" kind="neutral" />
            <Pill text="AI Safety" kind="neutral" />
            <Pill text="Secure Dashboard" kind="neutral" />
          </div>

          <h1 className="heroTitle">
            ChildSafeNet
            <span className="grad"> – Giám sát và cảnh báo rủi ro Internet cho trẻ em</span>
          </h1>

          <p className="csnUltraAuthLead">
            Đăng nhập để theo dõi website trẻ truy cập, xem cảnh báo an toàn,
            kiểm tra website thủ công và quản lý các quy tắc bảo vệ của gia đình.
          </p>

          <div className="csnUltraAuthTrust">
            <div className="csnUltraTrustItem">
              <span className="csnUltraTrustDot" />
              Theo dõi lịch sử truy cập
            </div>
            <div className="csnUltraTrustItem">
              <span className="csnUltraTrustDot" />
              Nhận kết quả ALLOW / WARN / BLOCK
            </div>
            <div className="csnUltraTrustItem">
              <span className="csnUltraTrustDot" />
              Thiết lập bảo vệ theo độ tuổi
            </div>
          </div>
        </section>

        <section className="csnUltraAuthPanel">
          <div className="card csnUltraAuthCard">
            <div className="csnUltraAuthHeader">
              <div>
                <div className="csnUltraAuthTitle">Đăng nhập tài khoản</div>
                <div className="cardText">
                  Truy cập dashboard phụ huynh hoặc trang quản trị hệ thống.
                </div>
              </div>

              <Pill text="Secure Access" kind="ok" />
            </div>

            <form onSubmit={onSubmit} className="csnUltraAuthForm">
              <Input
                label="Email"
                value={email}
                onChange={(e: any) => setEmail(e.target.value)}
                placeholder="parent@example.com"
              />

              <Input
                label="Mật khẩu"
                type="password"
                value={password}
                onChange={(e: any) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
              />

              <div className="csnUltraAuthHint">
                Dùng tài khoản phụ huynh để vào dashboard và quản lý an toàn Internet cho trẻ.
              </div>

              <Button type="submit" disabled={loading} style={{ width: "100%" }}>
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>

              {err && <div className="error">{err}</div>}
            </form>

            <div className="csnUltraAuthDivider">
              <span>hoặc</span>
            </div>

            <div className="csnUltraAuthAltActions">
              <Link to="/scan">
                <Button variant="ghost">Thử Manual Scan</Button>
              </Link>
            </div>

            <div className="csnUltraAuthFooterRow">
              <span className="muted">Chưa có tài khoản?</span>
              <Link to="/register" className="csnUltraAuthLink">
                Tạo tài khoản
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}