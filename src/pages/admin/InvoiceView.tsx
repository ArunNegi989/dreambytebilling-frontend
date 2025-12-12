// src/pages/admin/InvoiceView.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import styles from "../../assets/styles/admin/InvoiceView.module.css"; // create as needed or reuse others

export default function InvoiceView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoice = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const resp = await api.get(`/invoices/${id}`);
      setInvoice(resp.data);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.error || err?.message || "Failed to load invoice");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const downloadPdf = async () => {
    if (!id) return;
    try {
      const resp = await api.get(`/invoices/${id}/pdf`, { responseType: "blob" });
      const blob = new Blob([resp.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${invoice?.invoiceNo || id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download PDF", err);
      alert("Failed to download PDF");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!invoice) return <div>No invoice found</div>;

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1>Invoice {invoice.invoiceNo}</h1>
        <div>
          <button onClick={() => navigate(-1)} className={styles.ghost}>Back</button>
          <button onClick={downloadPdf} className={styles.primary}>Download PDF</button>
        </div>
      </div>

      <section className={styles.card}>
        <h3>Billed To</h3>
        <div>{invoice.billedTo?.name}</div>
        <div>{invoice.billedTo?.address}</div>
      </section>

      <section className={styles.card}>
        <h3>Items</h3>
        <table className={styles.table}>
          <thead><tr><th>#</th><th>Location</th><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead>
          <tbody>
            {(invoice.items || []).map((it: any, i: number) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{it.location}</td>
                <td>{it.specification}</td>
                <td>{it.qty}</td>
                <td>{Number(it.rate).toFixed(2)}</td>
                <td>{Number(it.amount).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className={styles.card}>
        <h3>Totals</h3>
        <div>Subtotal: ₹{(invoice.totals?.subtotal || 0).toFixed(2)}</div>
        <div>CGST: ₹{(invoice.totals?.cgst || 0).toFixed(2)}</div>
        <div>SGST: ₹{(invoice.totals?.sgst || 0).toFixed(2)}</div>
        <div>IGST: ₹{(invoice.totals?.igst || 0).toFixed(2)}</div>
        <div style={{ fontWeight: 700 }}>Grand Total: ₹{(invoice.totals?.grandTotal || 0).toFixed(2)}</div>
      </section>
    </div>
  );
}
