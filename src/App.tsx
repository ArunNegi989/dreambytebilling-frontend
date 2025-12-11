// src/App.tsx (example)
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Invoices from "./pages/admin/Invoices";
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

        {/* ...baaki nested routes yahan */}
      </Route>

      {/* fallback, etc. */}
    </Routes>
  );
}

export default AppRoutes;
