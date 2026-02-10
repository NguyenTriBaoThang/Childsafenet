import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import AlreadyLoggedIn from "../components/AlreadyLoggedIn";

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
      await auth.login({ email, password });
      const role = auth.role;
      if (role === "admin") nav("/admin/dataset");
      else nav("/dashboard");
    } catch (ex: any) {
      setErr(ex?.response?.data?.message || ex?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="card" style={{ maxWidth: 520, margin: "0 auto" }}>
        <h1>Đăng nhập</h1>
        <p className="muted">Dùng tài khoản phụ huynh để xem dashboard & lịch sử quét.</p>

        <form onSubmit={onSubmit}>
          <label className="muted">Email</label>
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />

          <label className="muted" style={{ marginTop: 12 }}>
            Password
          </label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="btn" type="submit" disabled={loading} style={{ marginTop: 14, width: "100%" }}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>

          {err && (
            <div className="alert" style={{ marginTop: 12 }}>
              {err}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}