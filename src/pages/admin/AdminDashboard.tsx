// src/pages/admin/AdminDashboard.tsx
import React, { useEffect, useState } from "react";
import styles from "../../assets/styles/admin/AdminDashboard.module.css";
import api from "../../api/axios";

/* ================= TYPES ================= */
interface Invoice {
  createdAt?: string;
}

interface Bill {
  createdAt?: string;
  paymentStatus?: string;
}

interface Quotation {
  createdAt?: string;
}

const AdminDashboard: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  /* ================= API CALL ================= */
  const loadDashboardData = async () => {
    try {
      const [invoiceRes, billRes, quotationRes] = await Promise.all([
        api.get("/api/invoice/getallinvoice"),
        api.get("/api/bill/getallbills"),
        api.get("/api/quotation/getallquotation"),
      ]);

      setInvoices(invoiceRes.data || []);
      setBills(billRes.data || []);
      setQuotations(quotationRes.data || []);
    } catch (error) {
      console.error("Dashboard data fetch failed", error);
    }
  };

  /* ================= CALCULATIONS ================= */

  const totalInvoices = invoices.length;
  const totalBills = bills.length;
  const totalQuotations = quotations.length;

  const today = new Date().toDateString();

  const todayInvoices = invoices.filter(
    (i) => i.createdAt && new Date(i.createdAt).toDateString() === today
  ).length;

  const todayBills = bills.filter(
    (b) => b.createdAt && new Date(b.createdAt).toDateString() === today
  ).length;

  const todayQuotations = quotations.filter(
    (q) => q.createdAt && new Date(q.createdAt).toDateString() === today
  ).length;

  const paidBills = bills.filter((b) => b.paymentStatus === "Paid").length;
  const unpaidBills = bills.filter((b) => b.paymentStatus !== "Paid").length;

  const quotationConversion =
    quotations.length > 0
      ? Math.round((invoices.length / quotations.length) * 100)
      : 0;

  const recentInvoices = [...invoices]
    .sort(
      (a, b) =>
        new Date(b.createdAt || "").getTime() -
        new Date(a.createdAt || "").getTime()
    )
    .slice(0, 5);

  /* ================= UI ================= */

  return (
    <div className={styles.dashboard}>
      {/* 🔥 HEADER */}
      <div className={styles.header}>
        <h2>Welcome Back, Admin 👋</h2>
        <p>Live data from invoices, bills & quotations</p>
      </div>

      {/* 📊 TOP STATS */}
      <div className={styles.cardsRow}>
        <div className={`${styles.card} ${styles.blue}`}>
          <p>Total Invoices</p>
          <h3>{totalInvoices}</h3>
          <span>All records</span>
        </div>

        <div className={`${styles.card} ${styles.green}`}>
          <p>Total Bills</p>
          <h3>{totalBills}</h3>
          <span>All records</span>
        </div>

        <div className={`${styles.card} ${styles.orange}`}>
          <p>Total Quotations</p>
          <h3>{totalQuotations}</h3>
          <span>All records</span>
        </div>
      </div>

      {/* 🧩 GRID SECTION */}
      <div className={styles.grid}>
        {/* TODAY PERFORMANCE */}
        <div className={styles.box}>
          <h4>Today’s Performance</h4>
          <div className={styles.detailRow}>
            <span>Invoices Created</span>
            <b>{todayInvoices}</b>
          </div>
          <div className={styles.detailRow}>
            <span>Bills Generated</span>
            <b>{todayBills}</b>
          </div>
          <div className={styles.detailRow}>
            <span>Quotations Sent</span>
            <b>{todayQuotations}</b>
          </div>
        </div>

       

        {/* QUOTATION INSIGHT */}
        <div className={styles.box}>
          <h4>Quotation Insights</h4>
          <div className={styles.detailRow}>
            <span>Total Quotations</span>
            <b>{totalQuotations}</b>
          </div>
          <div className={styles.detailRow}>
            <span>Converted to Invoice</span>
            <b>{quotationConversion}%</b>
          </div>
        </div>

        {/* RECENT INVOICES */}
        <div className={styles.box}>
          <h4>Recent Invoices</h4>
          {recentInvoices.length === 0 ? (
            <p>No recent invoices</p>
          ) : (
            recentInvoices.map((inv, index) => (
              <div key={index} className={styles.detailRow}>
                <span>Invoice #{index + 1}</span>
                <b>
                  {inv.createdAt
                    ? new Date(inv.createdAt).toLocaleDateString()
                    : "-"}
                </b>
              </div>
            ))
          )}
        </div>

        {/* SYSTEM INFO */}
        <div className={styles.box}>
          <h4>System Status</h4>
          <div className={styles.detailRow}>
            <span>Invoices API</span>
            <b className={styles.active}>Connected</b>
          </div>
          <div className={styles.detailRow}>
            <span>Bills API</span>
            <b className={styles.active}>Connected</b>
          </div>
          <div className={styles.detailRow}>
            <span>Quotation API</span>
            <b className={styles.active}>Connected</b>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
