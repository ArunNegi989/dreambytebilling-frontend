// src/pages/admin/QuotationList.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import styles from "../../assets/styles/admin/CreateInvoice.module.css";

/* ---------------- TYPES ---------------- */
interface Quotation {
  _id: string;
  invoiceNo: string;
  dateOfInvoice: string;
  billedTo?: {
    name?: string;
  };
  totals?: {
    grandTotal?: number;
  };
}

/* ---------------- HELPERS ---------------- */
const formatCurrency = (n = 0) =>
  `₹${n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

/* ---------------- COMPONENT ---------------- */
export default function QuotationList() {
  const navigate = useNavigate();

  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /* -------- FETCH ALL QUOTATIONS -------- */
  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/invoice");
      setQuotations(res.data || []);
    } catch (err) {
      console.error("Failed to load quotations", err);
      alert("Failed to load quotations");
    } finally {
      setLoading(false);
    }
  };

  /* -------- DOWNLOAD PDF -------- */
  const downloadPdf = async (id: string, invoiceNo?: string) => {
    try {
      const resp = await api.get(`/api/invoice/${id}/pdf`, {
        responseType: "blob",
      });
      const blob = new Blob([resp.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `quotation-${invoiceNo || id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Failed to download PDF");
    }
  };

  /* -------- DELETE QUOTATION -------- */
  const deleteQuotation = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this quotation?"))
      return;

    try {
      setDeletingId(id);
      await api.delete(`/api/invoice/${id}`);
      setQuotations((prev) => prev.filter((q) => q._id !== id));
    } catch {
      alert("Failed to delete quotation");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className={styles.left}>
        {/* ---------------- HEADER ---------------- */}
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>All Quotations</h1>
            <p className={styles.subtitle}>
              Manage quotations — edit, delete or download PDF
            </p>
          </div>

          {/* ✅ TOP RIGHT CREATE BUTTON */}
          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.primary}
              onClick={() => navigate("/admin/invoice/create")}
            >
              + Create Quotation
            </button>
          </div>
        </header>

        {/* ---------------- LIST ---------------- */}
        <section className={styles.card}>
          <div className={styles.itemsTable}>
            <div className={styles.itemsGridHeader}>
              <div>S.N.</div>
              <div>Quotation No</div>
              <div>Date</div>
              <div>Client</div>
              <div>Amount</div>
              <div>Actions</div>
            </div>

            {quotations.length === 0 ? (
              <div style={{ padding: 12 }}>No quotations found</div>
            ) : (
              quotations.map((q, index) => (
                <div key={q._id} className={styles.itemRow}>
                  <div>{index + 1}</div>

                  <div>{q.invoiceNo}</div>

                  <div>
                    {q.dateOfInvoice
                      ? new Date(q.dateOfInvoice).toLocaleDateString("en-GB")
                      : "-"}
                  </div>

                  <div>{q.billedTo?.name || "-"}</div>

                  <div>{formatCurrency(q.totals?.grandTotal)}</div>

                  {/* ---------------- ACTIONS ---------------- */}
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className={styles.primary}
                      onClick={() =>
                        navigate(`/admin/invoice/edit/${q._id}`)
                      }
                    >
                      Edit
                    </button>

                    <button
                      className={styles.ghost}
                      disabled={deletingId === q._id}
                      onClick={() => deleteQuotation(q._id)}
                    >
                      {deletingId === q._id ? "Deleting..." : "Delete"}
                    </button>

                    <button
                      className={styles.primary}
                      onClick={() => downloadPdf(q._id, q.invoiceNo)}
                    >
                      PDF
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
