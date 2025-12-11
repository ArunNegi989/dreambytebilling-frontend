import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { IInvoice } from "../../types/invoice";

export default function InvoiceView() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<IInvoice | null>(null);
  const [invoices, setInvoices] = useState<IInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      setLoading(true);
      api.get(`/api/invoices/${id}`).then(r => setInvoice(r.data)).catch(err => {
        console.error(err);
        alert("Failed to fetch invoice");
      }).finally(() => setLoading(false));
    } else {
      setLoading(true);
      api.get(`/api/invoices`).then(r => setInvoices(r.data || [])).catch(err => {
        console.error(err);
        alert("Failed to fetch invoices");
      }).finally(() => setLoading(false));
    }
  }, [id]);

  const openPdf = (invoiceId?: string) => {
    const targetId = invoiceId || id;
    if (!targetId) return alert("Invoice ID missing");
    const base = (import.meta.env.VITE_API_URL as string) || "";
    const url = `${base}/api/invoices/${targetId}/pdf`;
    window.open(url, "_blank");
  };

  const downloadPdf = async (invoiceId?: string, invoiceNo?: string) => {
    const targetId = invoiceId || id;
    if (!targetId) return alert("Invoice ID missing");
    try {
      const resp = await api.get(`/api/invoices/${targetId}/pdf`, { responseType: "blob" });
      const blob = new Blob([resp.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${invoiceNo || targetId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed", err);
      alert("Failed to download PDF");
    }
  };

  if (loading) return <div>Loading...</div>;

  if (!id) {
    return (
      <div style={{ maxWidth: 1100, margin: "20px auto", padding: 16, background: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>All Invoices ({invoices.length})</h2>
        </div>

        {invoices.length === 0 && <div>No invoices found.</div>}

        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
          <thead>
            <tr style={{ background: "#f3f4f6" }}>
              <th style={{ padding: 8 }}>#</th>
              <th style={{ padding: 8 }}>Invoice No</th>
              <th style={{ padding: 8 }}>Client</th>
              <th style={{ padding: 8 }}>Date</th>
              <th style={{ padding: 8 }}>Total</th>
              <th style={{ padding: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv, i) => (
              <tr key={inv._id}>
                <td style={{ padding: 8 }}>{i + 1}</td>
                <td style={{ padding: 8 }}>{inv.invoiceNo}</td>
                <td style={{ padding: 8 }}>{inv.client?.name || "-"}</td>
                <td style={{ padding: 8 }}>{new Date(inv.date).toLocaleDateString()}</td>
                <td style={{ padding: 8 }}>₹{(inv.grandTotal ?? 0).toFixed(2)}</td>
                <td style={{ padding: 8 }}>
                  <button style={{ marginRight: 8 }} onClick={() => navigate(`/admin/invoices/${inv._id}`)}>View</button>
                  <button style={{ marginRight: 8 }} onClick={() => openPdf(inv._id)}>Open PDF</button>
                  <button onClick={() => downloadPdf(inv._id, inv.invoiceNo)}>Download PDF</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!invoice) return <div>Invoice not found</div>;

  return (
    <div style={{ maxWidth: 900, margin: "20px auto", padding: 16, background: "#fff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Invoice {invoice.invoiceNo}</h2>
        <div>
          <button onClick={() => openPdf()} style={{ marginRight: 8 }}>Open PDF</button>
          <button onClick={() => downloadPdf(undefined, invoice.invoiceNo)}>Download PDF</button>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h3>{invoice.company.name}</h3>
          <div>{invoice.company.address}</div>
          <div>GST: {invoice.company.gst}</div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div><strong>Date:</strong> {new Date(invoice.date).toLocaleDateString()}</div>
          <div><strong>Place:</strong> {invoice.company.placeOfSupply || ""}</div>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <strong>Billed To</strong>
        <div>{invoice.client.name}</div>
        <div>{invoice.client.address}</div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
        <thead>
          <tr style={{ background: "#f3f4f6" }}>
            <th style={{ padding: 8 }}>#</th>
            <th style={{ padding: 8 }}>Description</th>
            <th style={{ padding: 8 }}>Qty</th>
            <th style={{ padding: 8 }}>Rate</th>
            <th style={{ padding: 8 }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {invoice.items.map((it, i) => (
            <tr key={i}>
              <td style={{ padding: 8 }}>{i + 1}</td>
              <td style={{ padding: 8 }}>{it.description}</td>
              <td style={{ padding: 8 }}>{it.qty}</td>
              <td style={{ padding: 8 }}>₹{Number(it.rate).toFixed(2)}</td>
              <td style={{ padding: 8 }}>₹{(it.amount ?? 0).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 12, float: "right", width: 300 }}>
        <div>Subtotal: ₹{(invoice.subtotal ?? 0).toFixed(2)}</div>
        <div>CGST: ₹{(invoice.cgst ?? 0).toFixed(2)}</div>
        <div>SGST: ₹{(invoice.sgst ?? 0).toFixed(2)}</div>
        <div>IGST: ₹{(invoice.igst ?? 0).toFixed(2)}</div>
        <hr />
        <div style={{ fontWeight: 700 }}>Grand Total: ₹{(invoice.grandTotal ?? 0).toFixed(2)}</div>
      </div>

      <div style={{ clear: "both", marginTop: 30 }}>
        <strong>Notes</strong>
        <div>{invoice.notes}</div>
      </div>
    </div>
  );
}
