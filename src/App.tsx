// src/App.tsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Invoices from "./pages/admin/Invoices";
import CreateInvoice from "./pages/admin/CreateInvoice";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import InvoiceView from "./pages/admin/InvoiceView";
import QuotationForm from "./pages/admin/QuotationForm";
import CreateQuotation from "./pages/admin/CreateQuotation";

function AppRoutes() {
  return (
    <>
      {/* ROUTES */}
      <Routes>
        {/* LOGIN ROUTE */}
        <Route path="/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />

        {/* ADMIN ROUTES */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="invoices/create" element={<CreateInvoice />} />
          <Route path="invoices/:id" element={<InvoiceView />} />
          <Route path="quotation" element={<QuotationForm />} />
          <Route path="/admin/invoice/create" element={<CreateQuotation />} />
          <Route path="/admin/invoice/edit/:id" element={<CreateQuotation />} />

        </Route>

        {/* fallback */}
        <Route path="*" element={<Login />} />
      </Routes>

      {/* TOAST CONTAINER (GLOBAL) */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        pauseOnHover
        closeOnClick
      />
    </>
  );
}

export default AppRoutes;
