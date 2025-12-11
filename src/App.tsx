// src/App.tsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Invoices from "./pages/admin/Invoices";
import CreateInvoice from "./pages/admin/CreateInvoice";
import Login from "./pages/auth/Login";

function AppRoutes() {
  return (
    <Routes>
      {/* LOGIN ROUTE */}
      <Route path="/login" element={<Login />} />

      {/* ADMIN ROUTES */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        {/* /admin */}
        <Route index element={<AdminDashboard />} />

        {/* /admin/invoices */}
        <Route path="invoices" element={<Invoices />} />

        {/* /admin/invoices/create */}
        <Route path="invoices/create" element={<CreateInvoice />} />


        {/* ...add other nested admin routes here */}
      </Route>

      {/* fallback / 404 can go here */}
      <Route path="*" element={<Login />} />
    </Routes>
  );
}

export default AppRoutes;
