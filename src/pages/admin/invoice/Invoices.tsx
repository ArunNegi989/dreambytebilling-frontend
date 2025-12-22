import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ReactPaginate from "react-paginate";
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

const ITEMS_PER_PAGE = 10;

/* ---------- HELPERS ---------- */
const formatDate = (d?: string) => {
  if (!d) return "-";
  try {
    return new Date(d).toLocaleDateString("en-GB");
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
  const [currentPage, setCurrentPage] = useState(0); // react-paginate = 0 based

  /* ---------- FETCH ---------- */
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const resp = await api.get("/api/invoice/getallinvoice");
      setInvoices(resp.data || []);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error || err?.message || "Failed to load invoices";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- DELETE ---------- */
  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await api.delete(`/api/invoice/${id}`);
      setInvoices((prev) => prev.filter((inv) => inv._id !== id));
      toast.success("Invoice deleted");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.error || err?.message || "Delete failed"
      );
    } finally {
      setDeletingId(null);
    }
  };

  /* ---------- DOWNLOAD ---------- */
  const downloadInvoicePdf = async (id: string, invoiceNo?: string) => {
    try {
      const resp = await api.get(`/api/invoice/${id}/pdf`, {
        responseType: "blob",
      });

      const blob = new Blob([resp.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${invoiceNo || id}.pdf`;
      a.click();

      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download PDF");
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  /* ---------- PAGINATION ---------- */
  const pageCount = Math.ceil(invoices.length / ITEMS_PER_PAGE);
  const offset = currentPage * ITEMS_PER_PAGE;
  const currentInvoices = invoices.slice(
    offset,
    offset + ITEMS_PER_PAGE
  );

  return (
    <div className={styles.wrapper}>
      {/* ---------- HEADER ---------- */}
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

      {/* ---------- TABLE ---------- */}
      <div className={styles.card}>
        {loading ? (
          <div>Loading invoices…</div>
        ) : error ? (
          <div className={styles.empty}>Error: {error}</div>
        ) : currentInvoices.length === 0 ? (
          <div className={styles.empty}>No invoices found</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>S No.</th>
                <th>Invoice No</th>
                <th>Customer</th>
                <th>GSTIN</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {currentInvoices.map((inv, idx) => (
                <tr key={inv._id}>
                  <td data-label="#">
                    {offset + idx + 1}
                  </td>

                  <td data-label="Invoice No">{inv.invoiceNo}</td>

                  <td data-label="Customer">
                    {inv.billedTo?.name || "-"}
                  </td>

                  <td data-label="GSTIN">
                    {inv.receiverGstin || "-"}
                  </td>

                  <td data-label="Date">
                    {formatDate(inv.dateOfInvoice || inv.createdAt)}
                  </td>

                  <td data-label="Amount">
                    {formatAmount(inv.totals?.grandTotal)}
                  </td>

                  <td data-label="Actions" className={styles.actions}>
                    <button
                      className={styles.viewBtn}
                      onClick={() =>
                        navigate(`/admin/invoices/edit/${inv._id}`)
                      }
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
                      className={styles.downloadBtn}
                      onClick={() =>
                        downloadInvoicePdf(inv._id, inv.invoiceNo)
                      }
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

      {/* ---------- PAGINATION ---------- */}
      {pageCount > 1 && (
        <ReactPaginate
          previousLabel="← Prev"
          nextLabel="Next →"
          breakLabel="..."
          pageCount={pageCount}
          onPageChange={({ selected }) => setCurrentPage(selected)}
          containerClassName={styles.pagination}
          pageClassName={styles.pageItem}
          pageLinkClassName={styles.pageLink}
          activeClassName={styles.activePage}
          previousClassName={styles.pageItem}
          nextClassName={styles.pageItem}
          disabledClassName={styles.disabled}
        />
      )}
    </div>
  );
};

export default Invoices;
