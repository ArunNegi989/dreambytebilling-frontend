import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ReactPaginate from "react-paginate";
import styles from "../../../assets/styles/admin/Invoices.module.css";
import api from "../../../api/axios";

interface Bill {
  _id: string;
  billNo: string;
  billedTo?: any;
  receiverGstin?: any;
  dateOfInvoice?: string;
  totals?: { subtotal?: number };
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

const Bill: React.FC = () => {
  const navigate = useNavigate();

  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0); // react-paginate = 0 based

  /* ---------- FETCH ---------- */
  const fetchBills = async () => {
    try {
      setLoading(true);
      setError(null);
      const resp = await api.get("/api/bill/getallbills");
      setBills(resp.data || []);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error || err?.message || "Failed to load bills";
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
      await api.delete(`/api/bill/deletebill/${id}`);
      setBills((prev) => prev.filter((b) => b._id !== id));
      toast.success("Bill deleted");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.error || err?.message || "Delete failed"
      );
    } finally {
      setDeletingId(null);
    }
  };

  /* ---------- DOWNLOAD ---------- */
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
      a.click();

      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download PDF");
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  /* ---------- PAGINATION ---------- */
  const pageCount = Math.ceil(bills.length / ITEMS_PER_PAGE);
  const offset = currentPage * ITEMS_PER_PAGE;
  const currentBills = bills.slice(offset, offset + ITEMS_PER_PAGE);

  return (
    <div className={styles.wrapper}>
      {/* ---------- HEADER ---------- */}
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

      {/* ---------- TABLE ---------- */}
      <div className={styles.card}>
        {loading ? (
          <div>Loading bills…</div>
        ) : error ? (
          <div className={styles.empty}>Error: {error}</div>
        ) : currentBills.length === 0 ? (
          <div className={styles.empty}>No bills found</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>S No.</th>
                <th>Bill No</th>
                <th>Customer</th>
                <th>GSTIN</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {currentBills.map((bill, idx) => (
                <tr key={bill._id}>
                  <td data-label="#">
                    {offset + idx + 1}
                  </td>

                  <td data-label="Bill No">{bill.billNo}</td>

                  <td data-label="Customer">
                    {bill.billedTo?.name || "-"}
                  </td>

                  <td data-label="GSTIN">
                    {bill.receiverGstin || "-"}
                  </td>

                  <td data-label="Date">
                    {formatDate(bill.dateOfInvoice || bill.createdAt)}
                  </td>

                  <td data-label="Amount">
                    {formatAmount(bill.totals?.subtotal)}
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
                      className={styles.downloadBtn}
                      onClick={() =>
                        downloadBillPdf(bill._id, bill.billNo)
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

export default Bill;
