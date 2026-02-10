import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Button } from "./Button";

export default function AlreadyLoggedIn() {
  const { logout, role } = useAuth();

  return (
    <div className="card" style={{ maxWidth: 420, margin: "40px auto", textAlign: "center" }}>
      <h2>Bạn đang đăng nhập</h2>

      <p className="muted" style={{ marginTop: 8 }}>
        Tài khoản hiện tại: <b>{role}</b>
      </p>

      <div style={{ display: "flex", gap: 12, marginTop: 20, justifyContent: "center" }}>
        <Link to="/dashboard">
          <Button>Vào Dashboard</Button>
        </Link>

        <Button variant="ghost" onClick={logout}>
          Logout
        </Button>
      </div>
    </div>
  );
}