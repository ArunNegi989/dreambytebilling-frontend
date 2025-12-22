// src/App.tsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";

// INVOICE
import Invoices from "./pages/admin/invoice/Invoices";
import CreateInvoice from "./pages/admin/invoice/CreateInvoice";

// AUTH
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// QUOTATION
import QuotationForm from "./pages/admin/Quotation/QuotationForm";
import CreateQuotation from "./pages/admin/Quotation/CreateQuotation";

// BILL (Without GST)
import Bill from "./pages/admin/invoicewithoutgst/Bill";
import CreateBill from "./pages/admin/invoicewithoutgst/CreateBill";

function AppRoutes() {
  return (
    <>
      <Routes>
        {/* ================= AUTH ================= */}
        <Route path="/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />

        {/* ================= ADMIN ================= */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* DASHBOARD */}
          <Route index element={<AdminDashboard />} />

          {/* INVOICES */}
          <Route path="invoices" element={<Invoices />} />
          <Route path="invoices/create" element={<CreateInvoice />} />
          <Route path="invoices/edit/:id" element={<CreateInvoice />} />

          {/* QUOTATIONS */}
          <Route path="quotation" element={<QuotationForm />} />
          <Route path="quotation/create" element={<CreateQuotation />} />
          <Route path="quotation/edit/:id" element={<CreateQuotation />} />

          {/* BILLS */}
          <Route path="bill" element={<Bill />} />
          <Route path="bill/createbill" element={<CreateBill />} />
          <Route path="bill/createbill/:id" element={<CreateBill />} />
        </Route>

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<Login />} />
      </Routes>

      {/* ================= TOAST ================= */}
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
