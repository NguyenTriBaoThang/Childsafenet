import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerApi } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import AlreadyLoggedIn from "../components/AlreadyLoggedIn";

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
      // nếu backend trả token => auto login
      if (res?.token) {
        await auth.login({ email, password });
        const role = auth.role;
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
        "Register failed";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="card" style={{ maxWidth: 520, margin: "0 auto" }}>
        <h1>Đăng ký</h1>
        <p className="muted">Tạo tài khoản phụ huynh hoặc admin (demo).</p>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          <label className="muted">Email</label>
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />

          <label className="muted">Password</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <label className="muted">Display name (optional)</label>
          <input
            className="input"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
            
          <button className="btn" disabled={loading}>
            {loading ? "Đang tạo..." : "Tạo tài khoản"}
          </button>

          {err && <div className="alert">{err}</div>}
        </form>

        <div className="muted" style={{ marginTop: 12 }}>
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}