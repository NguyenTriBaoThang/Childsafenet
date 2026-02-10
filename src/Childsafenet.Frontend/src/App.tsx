import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "./components/AppShell";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Scan from "./pages/Scan";

import AdminDataset from "./pages/admin/AdminDataset";
import AdminTrainJobs from "./pages/admin/AdminTrainJobs";

import { ProtectedRoute } from "./auth/ProtectedRoute";
import { AdminRoute } from "./auth/AdminRoute";

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/scan"
          element={
            <ProtectedRoute>
              <Scan />
            </ProtectedRoute>
          }
        />

        <Route 
          path="/register" 
          element={
            <Register />
          } 
        />

        {/* Admin only */}
        <Route
          path="/admin/dataset"
          element={
            <AdminRoute>
              <AdminDataset />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/train-jobs"
          element={
            <AdminRoute>
              <AdminTrainJobs />
            </AdminRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}