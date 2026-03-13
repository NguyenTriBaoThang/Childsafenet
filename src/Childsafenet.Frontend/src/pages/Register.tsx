import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerApi } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import AlreadyLoggedIn from "../components/AlreadyLoggedIn";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Pill } from "../components/Pill";

export default function Register() {
  const nav = useNavigate();
  const auth = useAuth();
  const { isAuthed } = useAuth();

  const [email, setEmail] = useState("parent1@test.com");
  const [password, setPassword] = useState("Parent123$");
  const [fullName, setFullName] = useState("Parent 1");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (isAuthed) {
    return <AlreadyLoggedIn />;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const res = await registerApi({ email, password, fullName });

      if (res?.token) {
        const role = await auth.login({ email, password });
        if (role === "admin") nav("/admin/dataset");
        else nav("/dashboard");
      } else {
        nav("/login", { replace: true });
      }
    } catch (ex: any) {
      const msg =
        ex?.response?.data?.message ||
        ex?.response?.data?.error ||
        ex?.message ||
        "Tạo tài khoản thất bại";
      setErr(msg);
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
            <Pill text="Child Protection" kind="neutral" />
          </div>

          <h1 className="heroTitle">
            ChildSafeNet
            <span className="grad"> – Giám sát và cảnh báo rủi ro Internet cho trẻ em</span>
          </h1>

          <p className="csnUltraAuthLead">
            Tạo tài khoản để bắt đầu quản lý môi trường Internet an toàn hơn cho trẻ,
            theo dõi website truy cập, và thiết lập các quy tắc bảo vệ phù hợp với gia đình.
          </p>

          <div className="csnUltraAuthTrust">
            <div className="csnUltraTrustItem">
              <span className="csnUltraTrustDot" />
              Theo dõi lịch sử truy cập
            </div>
            <div className="csnUltraTrustItem">
              <span className="csnUltraTrustDot" />
              Cảnh báo website đáng ngờ
            </div>
            <div className="csnUltraTrustItem">
              <span className="csnUltraTrustDot" />
              Block / Allow thủ công
            </div>
          </div>
        </section>

        <section className="csnUltraAuthPanel">
          <div className="card csnUltraAuthCard">
            <div className="csnUltraAuthHeader">
              <div>
                <div className="csnUltraAuthTitle">Tạo tài khoản phụ huynh</div>
                <div className="cardText">
                  Bắt đầu với ChildSafeNet để thiết lập bảo vệ Internet cho trẻ.
                </div>
              </div>

              <Pill text="Secure Sign Up" kind="ok" />
            </div>

            <form onSubmit={onSubmit} className="csnUltraAuthForm">
              <Input
                label="Họ và tên"
                value={fullName}
                onChange={(e: any) => setFullName(e.target.value)}
                placeholder="Nhập họ và tên"
              />

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
                Tài khoản này sẽ được dùng để vào dashboard phụ huynh và quản lý cài đặt bảo vệ.
              </div>

              <Button type="submit" disabled={loading} style={{ width: "100%" }}>
                {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
              </Button>

              {err && <div className="error">{err}</div>}
            </form>

            <div className="csnUltraAuthDivider">
              <span>hoặc</span>
            </div>

            <div className="csnUltraAuthFooterRow">
              <span className="muted">Đã có tài khoản?</span>
              <Link to="/login" className="csnUltraAuthLink">
                Đăng nhập ngay
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}