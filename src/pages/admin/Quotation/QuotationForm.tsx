import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../../api/axios";
import styles from "../../../assets/styles/admin/QuotationForm.module.css";

/* ---------------- TYPES ---------------- */
interface Quotation {
  _id: string;
  quotationNo: string;
  quotationDate?: string;
  clientName: string;
  totals?: {
    totalAmount?: number;
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
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  /* ---------- FETCH ---------- */
  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/quotation/getallquotation");
      setQuotations(res.data || []);
    } catch {
      toast.error("Failed to load quotations");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- DOWNLOAD PDF ---------- */
  const downloadPdf = async (id: string, quotationNo: string) => {
    try {
      setDownloadingId(id);
      const resp = await api.get(`/api/quotation/${id}/pdf`, {
        responseType: "blob",
      });

      const blob = new Blob([resp.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `quotation-${quotationNo}.pdf`;
      a.click();

      window.URL.revokeObjectURL(url);
      toast.success("PDF downloaded");
    } catch {
      toast.error("Failed to download PDF");
    } finally {
      setDownloadingId(null);
    }
  };

  /* ---------- DELETE ---------- */
  const deleteQuotation = async (id: string) => {
    try {
      setDeletingId(id);
      await api.delete(`/api/quotation/deletequitation/${id}`);
      setQuotations((prev) => prev.filter((q) => q._id !== id));
      toast.success("Quotation deleted successfully");
    } catch {
      toast.error("Failed to delete quotation");
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  if (loading) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.page}>
      {/* ---------- HEADER ---------- */}
      <header className={styles.header}>
        <div>
          <h1>Quotation Management</h1>
          <p>View, edit, delete or download quotations</p>
        </div>

        <button
          className={styles.createBtn}
          onClick={() => navigate("/admin/quotation/create")}
        >
          + New Quotation
        </button>
      </header>

      {/* ---------- TABLE ---------- */}
      <section className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <span>S.N.</span>
          <span>Quotation No.</span>
          <span>Date</span>
          <span>Client</span>
          <span>Amount</span>
          <span>Actions</span>
        </div>

        {quotations.length === 0 ? (
          <div className={styles.empty}>No quotations found</div>
        ) : (
          quotations.map((q, index) => (
            <div key={q._id} className={styles.tableRow}>
              <div data-label="S.N.">{index + 1}</div>

              <div data-label="Quotation No" className={styles.bold}>
                {q.quotationNo}
              </div>

              <div data-label="Date">
                {q.quotationDate
                  ? new Date(q.quotationDate).toLocaleDateString("en-GB")
                  : "-"}
              </div>

              <div data-label="Client">{q.clientName}</div>

              <div data-label="Amount" className={styles.amount}>
                {formatCurrency(q.totals?.totalAmount || 0)}
              </div>

              <div data-label="Actions" className={styles.actions}>
                <button
                  className={styles.edit}
                  onClick={() => navigate(`/admin/quotation/edit/${q._id}`)}
                >
                  Edit
                </button>

                <button
                  className={styles.delete}
                  disabled={deletingId === q._id}
                  onClick={() => deleteQuotation(q._id)}
                >
                  {deletingId === q._id ? "Deleting..." : "Delete"}
                </button>

                <button
                  className={styles.download}
                  disabled={downloadingId === q._id}
                  onClick={() => downloadPdf(q._id, q.quotationNo)}
                >
                  {downloadingId === q._id ? "Downloading..." : "PDF"}
                </button>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
