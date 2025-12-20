import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "../../../assets/styles/admin/Invoices.module.css";
import api from "../../../api/axios";

interface Bill {
  _id: string;
  billNo: string;
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

const Bill: React.FC = () => {
  const navigate = useNavigate();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /* ---------------- FETCH BILLS ---------------- */
  const fetchBills = async () => {
    try {
      setLoading(true);
      setError(null);
      const resp = await api.get("/api/bill/getallbills");
      setBills(resp.data || []);
    } catch (err: any) {
      console.error("Failed to fetch bills", err);
      const msg =
        err?.response?.data?.error || err?.message || "Failed to load bills";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- DELETE BILL ---------------- */
  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await api.delete(`/api/bill/deletebill/${id}`);
      setBills((prev) => prev.filter((bill) => bill._id !== id));
      toast.success("Bill deleted successfully");
    } catch (err: any) {
      console.error("Delete failed", err);
      toast.error(
        err?.response?.data?.error || err?.message || "Failed to delete bill"
      );
    } finally {
      setDeletingId(null);
    }
  };

  /* ---------------- DOWNLOAD PDF ---------------- */
  const downloadBillPdf = async (billId: string, billNo?: string) => {
    try {
      const resp = await api.get(`/api/bill/${billId}/pdf`, {
        responseType: "blob",
      });

      const blob = new Blob([resp.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `bill-${billNo || billId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      toast.error("Failed to download PDF");
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Bills</h1>
          <p className={styles.subtitle}>
            View, manage and generate all your bills here.
          </p>
        </div>
        <button
          className={styles.createBtn}
          onClick={() => navigate("/admin/bill/createbill")}
        >
          ➕ Create / Generate Bill
        </button>
      </div>

      <div className={styles.card}>
        {loading ? (
          <div>Loading bills…</div>
        ) : error ? (
          <div className={styles.empty}>Error: {error}</div>
        ) : bills.length === 0 ? (
          <div className={styles.empty}>
            No bills yet. Click Create to add one.
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>S no.</th>
                <th>Bill No</th>
                <th>Customer</th>
                <th>Receiver's GSTIN</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((bill, idx) => (
                <tr key={bill._id}>
                  <td data-label="#">{idx + 1}</td>

                  <td data-label="Bill No">{bill.billNo}</td>

                  <td data-label="Customer">{bill.billedTo?.name || "-"}</td>

                  <td data-label="GSTIN">{bill.receiverGstin || "-"}</td>

                  <td data-label="Date">
                    {formatDate(bill.dateOfInvoice || bill.createdAt)}
                  </td>

                  <td data-label="Amount">
                    {formatAmount(bill.totals?.grandTotal)}
                  </td>

                  <td data-label="Actions" className={styles.actions}>
                    <button
                      className={styles.viewBtn}
                      onClick={() =>
                        navigate(`/admin/bill/createbill/${bill._id}`)
                      }
                    >
                      Edit Bill
                    </button>

                    <button
                      className={styles.deleteBtn}
                      disabled={deletingId === bill._id}
                      onClick={() => handleDelete(bill._id)}
                    >
                      {deletingId === bill._id ? "Deleting..." : "Delete"}
                    </button>

                    <button
                      type="button"
                      className="btn-success"
                      onClick={() => downloadBillPdf(bill._id, bill.billNo)}
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

export default Bill;
