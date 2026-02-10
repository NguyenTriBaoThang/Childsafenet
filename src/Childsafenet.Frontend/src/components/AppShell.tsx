import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { Button } from "./Button";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { isAuthed, role, logout } = useAuth();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? "navLink active" : "navLink";

  return (
    <div className="app">
      <header className="topbar">
        <Link to="/" className="brand">
          <span className="logoDot" />
          ChildSafeNet
        </Link>

        <nav className="nav">
          <NavLink to="/" className={linkClass}>
            Home
          </NavLink>

          {!isAuthed ? (
            <>
              <NavLink to="/login" className={linkClass}>
                Login
              </NavLink>
              <NavLink to="/register" className={linkClass}>
                Register
              </NavLink>
            </>
          ) : (
            <>
              {/* Parent menu */}
              {role === "parent" && (
                <>
                  <NavLink to="/dashboard" className={linkClass}>
                    Dashboard
                  </NavLink>
                  <NavLink to="/scan" className={linkClass}>
                    Scan
                  </NavLink>
                </>
              )}

              {/* Admin menu */}
              {role === "admin" && (
                <>
                  <NavLink to="/admin/dataset" className={linkClass}>
                    Dataset
                  </NavLink>
                  <NavLink to="/admin/train-jobs" className={linkClass}>
                    Train Jobs
                  </NavLink>
                </>
              )}

              <Button variant="ghost" onClick={logout}>
                Logout
              </Button>
            </>
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