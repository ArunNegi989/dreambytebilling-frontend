// src/pages/admin/Invoices.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../assets/styles/admin/Invoices.module.css";
import api from "../../api/axios";

interface Invoice {
  _id: string;
  invoiceNo: string;
  billedTo?: any;
  dateOfInvoice?: string;
  totals?: { grandTotal?: number };
  createdAt?: string;
}

const formatDate = (d?: string) => {
  if (!d) return "-";
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return d;
  }
};

const formatAmount = (n?: number) => {
  if (!n && n !== 0) return "₹0.00";
  return `₹${n!.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const Invoices: React.FC = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const resp = await api.get("/api/invoices/getallinvoice");
      setInvoices(resp.data || []);
    } catch (err: any) {
      console.error("Failed to fetch invoices", err);
      setError(err?.response?.data?.error || err?.message || "Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Invoices</h1>
          <p className={styles.subtitle}>View, manage and generate all your invoices here.</p>
        </div>
        <button className={styles.createBtn} onClick={() => navigate("/admin/invoices/create")}>➕ Create / Generate Invoice</button>
      </div>

      <div className={styles.card}>
        {loading ? (
          <div>Loading invoices…</div>
        ) : error ? (
          <div className={styles.empty}>Error: {error}</div>
        ) : invoices.length === 0 ? (
          <div className={styles.empty}>No invoices yet. Click Create to add one.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Invoice No</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv, idx) => (
                <tr key={inv._id}>
                  <td>{idx + 1}</td>
                  <td>{inv.invoiceNo}</td>
                  <td>{inv.billedTo?.name || "-"}</td>
                  <td>{formatDate(inv.dateOfInvoice || inv.createdAt)}</td>
                  <td>{formatAmount(inv.totals?.grandTotal)}</td>
                  <td><button className={styles.viewBtn} onClick={() => navigate(`/admin/invoices/${inv._id}`)}>View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Invoices;
