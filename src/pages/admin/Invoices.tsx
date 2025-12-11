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

const dummyInvoices: Invoice[] = [
  { id: "1", number: "INV-1001", customerName: "Dreambyte Solutions", date: "2025-11-25", amount: 19470, status: "UNPAID" },
  { id: "2", number: "INV-1002", customerName: "Acme Corp", date: "2025-10-02", amount: 5400, status: "PAID" },
  { id: "3", number: "INV-1003", customerName: "Beta Traders", date: "2025-09-15", amount: 12000, status: "PARTIAL" },
];

const formatDate = (d: string) => {
  try {
    const dt = new Date(d);
    return dt.toLocaleDateString();
  } catch {
    return d;
  }
};

const formatAmount = (n: number) => {
  return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const getStatusBadgeClass = (status: Invoice["status"]) => {
  switch (status) {
    case "PAID":
      return styles.statusPaid;
    case "UNPAID":
      return styles.statusUnpaid;
    case "PARTIAL":
      return styles.statusPartial;
    case "DRAFT":
    default:
      return styles.statusDraft;
  }
};

const Invoices: React.FC = () => {
  const navigate = useNavigate();

  // NOTE: navigate to the admin nested route (absolute path)
  const handleCreateInvoice = () => {
    navigate("/admin/invoices/create");
  };

  const handleView = (id: string) => {
    navigate(`/admin/invoices/${id}`);
  };

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

      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Invoice No</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {dummyInvoices.map((inv, idx) => (
              <tr key={inv.id}>
                <td>{idx + 1}</td>
                <td>{inv.number}</td>
                <td>{inv.customerName}</td>
                <td>{formatDate(inv.date)}</td>
                <td>{formatAmount(inv.amount)}</td>
                <td>
                  <span className={`${styles.statusBadge} ${getStatusBadgeClass(inv.status)}`}>
                    {inv.status}
                  </span>
                </td>
                <td>
                  <button className={styles.viewBtn} onClick={() => handleView(inv.id)}>
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {dummyInvoices.length === 0 && (
          <div className={styles.empty}>No invoices yet. Click Create to add one.</div>
        )}
      </div>
    </div>
  );
};

export default Invoices;
