import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Button } from "./Button";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { isAuthed, logout } = useAuth();

  return (
    <div className="app">
      <header className="topbar">
        <Link to="/" className="brand">
          <span className="logoDot" />
          ChildSafeNet
        </Link>

        <nav className="nav">
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? "navLink active" : "navLink")}
          >
            Home
          </NavLink>

          {isAuthed ? (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) => (isActive ? "navLink active" : "navLink")}
              >
                Dashboard
              </NavLink>

              <NavLink
                to="/scan"
                className={({ isActive }) => (isActive ? "navLink active" : "navLink")}
              >
                Scan
              </NavLink>

              {/* ✅ Option B */}
              <NavLink
                to="/dataset"
                className={({ isActive }) => (isActive ? "navLink active" : "navLink")}
              >
                Dataset
              </NavLink>

              <Button variant="ghost" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <NavLink
              to="/login"
              className={({ isActive }) => (isActive ? "navLink active" : "navLink")}
            >
              Login
            </NavLink>
          )}
        </nav>
      </header>

      <main className="container">{children}</main>

      <footer className="footer">
        <div>© {new Date().getFullYear()} ChildSafeNet • Demo</div>
      </footer>
    </div>
  );
}