// src/pages/admin/Invoices.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../assets/styles/admin/Invoices.module.css";

interface Invoice {
  id: string;
  number: string;
  customerName: string;
  date: string;
  amount: number;
  status: "PAID" | "UNPAID" | "PARTIAL" | "DRAFT";
}

const dummyInvoices: Invoice[] = [/* ... same as before ... */];

const Invoices: React.FC = () => {
  const navigate = useNavigate();

  const handleCreateInvoice = () => {
    navigate("/admin/invoices/new");
  };

  // formatDate, formatAmount, getStatusBadgeClass same…

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Invoices</h1>
          <p className={styles.subtitle}>
            View, manage and generate all your invoices here.
          </p>
        </div>

        <button
          type="button"
          className={styles.createBtn}
          onClick={handleCreateInvoice}
        >
          ➕ Create / Generate Invoice
        </button>
      </div>

      {/* table card ... (same as before) */}
    </div>
  );
};

export default Invoices;
