import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { loginApi } from "../api/client";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const nav = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("parent1@test.com");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await loginApi({ email, password });
      login(data.token);
      nav("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="center">
      <Card className="authCard">
        <h2 className="h2">Đăng nhập</h2>
        <p className="muted">Dùng tài khoản phụ huynh để xem dashboard & lịch sử quét.</p>

        <form onSubmit={onSubmit} className="form">
          <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button disabled={loading}>{loading ? "Đang đăng nhập..." : "Đăng nhập"}</Button>
          {error && <div className="error">{error}</div>}
          <div className="muted" style={{ fontSize: 12 }}>
            Chưa có account? Tạo bằng Swagger: <code>/api/auth/register</code>
          </div>
        </form>
      </Card>
    </div>
  );
}