import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "../../../assets/styles/admin/Invoices.module.css";
import api from "../../../api/axios";

interface Invoice {
  _id: string;
  invoiceNo: string;
  billedTo?: any;
  receiverGstin?: any;
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
  return `₹${n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const Invoices: React.FC = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /* ---------------- FETCH INVOICES ---------------- */
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const resp = await api.get("/api/invoice/getallinvoice");
      setInvoices(resp.data || []);
    } catch (err: any) {
      console.error("Failed to fetch invoices", err);
      const msg =
        err?.response?.data?.error || err?.message || "Failed to load invoices";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- DIRECT DELETE ---------------- */
  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);

      await api.delete(`/api/invoice/${id}`);

      // remove from UI instantly
      setInvoices((prev) => prev.filter((inv) => inv._id !== id));

      toast.success("Invoice deleted successfully");
    } catch (err: any) {
      console.error("Delete failed", err);
      toast.error(
        err?.response?.data?.error || err?.message || "Failed to delete invoice"
      );
    } finally {
      setDeletingId(null);
    }
  };
  const downloadInvoicePdf = async (invoiceId: string, invoiceNo?: string) => {
    try {
      const resp = await api.get(`/api/invoice/${invoiceId}/pdf`, {
        responseType: "blob",
      });

      const blob = new Blob([resp.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${invoiceNo || invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download PDF", err);
      alert("Failed to download PDF");
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
          <p className={styles.subtitle}>
            View, manage and generate all your invoices here.
          </p>
        </div>
        <button
          className={styles.createBtn}
          onClick={() => navigate("/admin/invoices/create")}
        >
          ➕ Create / Generate Invoice
        </button>
      </div>

      <div className={styles.card}>
        {loading ? (
          <div>Loading invoices…</div>
        ) : error ? (
          <div className={styles.empty}>Error: {error}</div>
        ) : invoices.length === 0 ? (
          <div className={styles.empty}>
            No invoices yet. Click Create to add one.
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>S no.</th>
                <th>Invoice No</th>
                <th>Customer</th>
                <th>Receiver's GSTIN</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv, idx) => (
                <tr key={inv._id}>
                  <td data-label="#"> {idx + 1} </td>

                  <td data-label="Invoice No">{inv.invoiceNo}</td>

                  <td data-label="Customer">{inv.billedTo?.name || "-"}</td>

                  <td data-label="GSTIN">{inv.receiverGstin || "-"}</td>

                  <td data-label="Date">
                    {formatDate(inv.dateOfInvoice || inv.createdAt)}
                  </td>

                  <td data-label="Amount">
                    {formatAmount(inv.totals?.grandTotal)}
                  </td>

                  <td data-label="Actions" className={styles.actions}>
                    <button
  className={styles.viewBtn}
  onClick={() => navigate(`/admin/invoices/edit/${inv._id}`)}
>
  Edit
</button>


                    <button
                      className={styles.deleteBtn}
                      disabled={deletingId === inv._id}
                      onClick={() => handleDelete(inv._id)}
                    >
                      {deletingId === inv._id ? "Deleting..." : "Delete"}
                    </button>

                    <button
                      type="button"
                      className="btn-success"
                      onClick={() => downloadInvoicePdf(inv._id, inv.invoiceNo)}
                    >
                      Download PDF
                    </button>
                  </td>
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
