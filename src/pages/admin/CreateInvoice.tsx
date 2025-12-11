// src/pages/admin/CreateInvoice.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios"; // make sure this path is correct

// Simple types (if you have shared types, import them instead)
export interface IItem {
  description: string;
  qty: number;
  rate: number;
  amount: number;
  startDate?: string;
  endDate?: string;
  specification?: string;
}
export interface ICompanyOrClient {
  name: string;
  address: string;
  gst?: string;
  pan?: string;
  placeOfSupply?: string;
}
export interface IInvoice {
  invoiceNo: string;
  date: string;
  placeOfSupply?: string;
  company: ICompanyOrClient;
  client: ICompanyOrClient;
  items: IItem[];
  taxRate: number;
  notes?: string;
  bankDetails?: { name?: string; ifsc?: string; accNo?: string };
}

const defaultItem = (): IItem => ({
  description: "",
  qty: 1,
  rate: 0,
  amount: 0,
  startDate: "",
  endDate: "",
  specification: "",
});

export default function CreateInvoice(): JSX.Element {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const [invoice, setInvoice] = useState<IInvoice>({
    invoiceNo: `INV-${Date.now()}`,
    date: new Date().toISOString().slice(0, 10),
    placeOfSupply: "",
    company: { name: "Your Company Pvt Ltd", address: "", gst: "", pan: "", placeOfSupply: "" },
    client: { name: "", address: "", gst: "", pan: "", placeOfSupply: "" },
    items: [{ description: "Sample item", qty: 1, rate: 16500, amount: 16500, startDate: "", endDate: "" }],
    taxRate: 18,
    notes: "Thank you for your business.",
    bankDetails: { name: "", ifsc: "", accNo: "" },
  });

  // Generic setter for nested fields using dot path (like "company.name")
  const setField = (path: string, value: any) => {
    setInvoice(prev => {
      const copy: any = JSON.parse(JSON.stringify(prev));
      const parts = path.split(".");
      let cur = copy;
      for (let i = 0; i < parts.length - 1; i++) {
        if (cur[parts[i]] === undefined) cur[parts[i]] = {};
        cur = cur[parts[i]];
      }
      cur[parts[parts.length - 1]] = value;
      return copy as IInvoice;
    });
  };

  const updateItem = (index: number, field: keyof IItem, value: any) => {
    setInvoice(prev => {
      const items = prev.items.map((it, i) => {
        if (i !== index) return it;
        // ensure numeric fields are numbers
        const newVal =
          field === "qty" || field === "rate" || field === "amount"
            ? Number(value || 0)
            : value;
        return { ...it, [field]: newVal };
      });
      // recalc amount (qty * rate) for each item
      const itemsWithAmount = items.map(it => ({ ...it, amount: Number(it.qty || 0) * Number(it.rate || 0) }));
      return { ...prev, items: itemsWithAmount };
    });
  };

  const addItem = () => setInvoice(prev => ({ ...prev, items: [...prev.items, defaultItem()] }));
  const removeItem = (index: number) => setInvoice(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));

  const calculateSummary = () => {
    const subtotal = invoice.items.reduce((s, it) => s + (Number(it.amount) || 0), 0);
    const taxRate = Number(invoice.taxRate || 0);
    const sameState =
      !!invoice.company.placeOfSupply &&
      !!invoice.client.placeOfSupply &&
      invoice.company.placeOfSupply === invoice.client.placeOfSupply;
    let cgst = 0,
      sgst = 0,
      igst = 0;
    if (sameState) {
      cgst = +(subtotal * (taxRate / 2) / 100);
      sgst = +(subtotal * (taxRate / 2) / 100);
    } else {
      igst = +(subtotal * taxRate / 100);
    }
    const totalTax = cgst + sgst + igst;
    const grandTotal = subtotal + totalTax;
    return { subtotal, cgst, sgst, igst, totalTax, grandTotal };
  };

  const summary = calculateSummary();

  const validateBeforeSave = (): string | null => {
    if (!invoice.client.name?.trim()) return "Please enter client name";
    if (!invoice.company.name?.trim()) return "Please enter company name";
    if (!invoice.items.length) return "Please add at least one item";
    for (let i = 0; i < invoice.items.length; i++) {
      const it = invoice.items[i];
      if (!it.description?.trim()) return `Please enter description for item ${i + 1}`;
      if (!it.qty || Number(it.qty) <= 0) return `Qty must be > 0 for item ${i + 1}`;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const err = validateBeforeSave();
    if (err) {
      alert(err);
      return;
    }

    try {
      setSaving(true);
      const resp = await api.post("/api/invoices", invoice);
      const saved = resp.data;
      alert("Invoice saved");
      // support both _id and id
      const newId = saved?._id || saved?.id;
      if (newId) navigate(`/admin/invoices/${newId}`);
      else navigate("/admin/invoices");
    } catch (err: any) {
      console.error("Save failed", err);
      alert(err?.response?.data?.error || err?.message || "Failed to save invoice");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 980, margin: "18px auto", padding: 18, background: "#fff", borderRadius: 8, boxShadow: "0 6px 18px rgba(0,0,0,0.06)" }}>
      <h2 style={{ marginTop: 0 }}>Create Invoice</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label>Invoice No</label>
            <input
              className="input"
              value={invoice.invoiceNo}
              onChange={e => setField("invoiceNo", e.target.value)}
            />
          </div>

          <div style={{ width: 160 }}>
            <label>Date</label>
            <input
              className="input"
              type="date"
              value={(invoice.date || "").slice(0, 10)}
              onChange={e => setField("date", e.target.value)}
            />
          </div>

          <div style={{ width: 200 }}>
            <label>Place of Supply</label>
            <input
              className="input"
              value={invoice.placeOfSupply || ""}
              onChange={e => setField("placeOfSupply", e.target.value)}
              placeholder="State"
            />
          </div>
        </div>

        <section style={{ marginTop: 12 }}>
          <h4>Company Details</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <input className="input" placeholder="Company name" value={invoice.company.name} onChange={e => setField("company.name", e.target.value)} />
            <input className="input" placeholder="PAN" value={invoice.company.pan || ""} onChange={e => setField("company.pan", e.target.value)} />
            <input className="input" placeholder="Company address" value={invoice.company.address} onChange={e => setField("company.address", e.target.value)} />
            <input className="input" placeholder="GSTIN" value={invoice.company.gst || ""} onChange={e => setField("company.gst", e.target.value)} />
            <input className="input" placeholder="Place of Supply (state)" value={invoice.company.placeOfSupply || ""} onChange={e => setField("company.placeOfSupply", e.target.value)} />
            <div />
          </div>
        </section>

        <section style={{ marginTop: 12 }}>
          <h4>Client Details</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <input className="input" placeholder="Client name" value={invoice.client.name} onChange={e => setField("client.name", e.target.value)} />
            <input className="input" placeholder="Client PAN" value={invoice.client.pan || ""} onChange={e => setField("client.pan", e.target.value)} />
            <input className="input" placeholder="Client address" value={invoice.client.address} onChange={e => setField("client.address", e.target.value)} />
            <input className="input" placeholder="Client GSTIN" value={invoice.client.gst || ""} onChange={e => setField("client.gst", e.target.value)} />
            <input className="input" placeholder="Place of Supply (state)" value={invoice.client.placeOfSupply || ""} onChange={e => setField("client.placeOfSupply", e.target.value)} />
            <div />
          </div>
        </section>

        <section style={{ marginTop: 12 }}>
          <h4>Items</h4>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
            <thead>
              <tr style={{ background: "#f3f4f6" }}>
                <th style={{ padding: 8 }}>#</th>
                <th style={{ padding: 8 }}>Description</th>
                <th style={{ padding: 8 }}>Spec</th>
                <th style={{ padding: 8 }}>Qty</th>
                <th style={{ padding: 8 }}>Rate</th>
                <th style={{ padding: 8 }}>Start</th>
                <th style={{ padding: 8 }}>End</th>
                <th style={{ padding: 8 }}>Amount</th>
                <th style={{ padding: 8 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((it, i) => (
                <tr key={i}>
                  <td style={{ padding: 8 }}>{i + 1}</td>
                  <td style={{ padding: 8 }}>
                    <input className="input" value={it.description} onChange={e => updateItem(i, "description", e.target.value)} />
                  </td>
                  <td style={{ padding: 8 }}>
                    <input className="input" value={it.specification || ""} onChange={e => updateItem(i, "specification", e.target.value)} />
                  </td>
                  <td style={{ padding: 8 }}>
                    <input className="input" type="number" value={it.qty} onChange={e => updateItem(i, "qty", Number(e.target.value || 0))} />
                  </td>
                  <td style={{ padding: 8 }}>
                    <input className="input" type="number" value={it.rate} onChange={e => updateItem(i, "rate", Number(e.target.value || 0))} />
                  </td>
                  <td style={{ padding: 8 }}>
                    <input className="input" type="date" value={it.startDate || ""} onChange={e => updateItem(i, "startDate", e.target.value)} />
                  </td>
                  <td style={{ padding: 8 }}>
                    <input className="input" type="date" value={it.endDate || ""} onChange={e => updateItem(i, "endDate", e.target.value)} />
                  </td>
                  <td style={{ padding: 8 }}>₹{(it.amount || 0).toFixed(2)}</td>
                  <td style={{ padding: 8 }}>
                    <button type="button" onClick={() => removeItem(i)} style={{ background: "#ef4444" }}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 8 }}>
            <button type="button" onClick={addItem} style={{ background: "#0f172a" }}>+ Add item</button>
          </div>
        </section>

        <section style={{ marginTop: 12, display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label>Notes</label>
            <textarea className="input" rows={4} value={invoice.notes || ""} onChange={e => setField("notes", e.target.value)} />
            <h4 style={{ marginTop: 12 }}>Bank Details (optional)</h4>
            <input className="input" placeholder="Bank name" value={invoice.bankDetails?.name || ""} onChange={e => setField("bankDetails.name", e.target.value)} />
            <input className="input" placeholder="A/C No" value={invoice.bankDetails?.accNo || ""} onChange={e => setField("bankDetails.accNo", e.target.value)} />
            <input className="input" placeholder="IFSC" value={invoice.bankDetails?.ifsc || ""} onChange={e => setField("bankDetails.ifsc", e.target.value)} />
          </div>

          <div style={{ width: 320, background: "#f8fafc", padding: 12, borderRadius: 6 }}>
            <div style={{ marginBottom: 6 }}>Subtotal: <strong>₹{summary.subtotal.toFixed(2)}</strong></div>
            <div>CGST: ₹{summary.cgst.toFixed(2)}</div>
            <div>SGST: ₹{summary.sgst.toFixed(2)}</div>
            <div>IGST: ₹{summary.igst.toFixed(2)}</div>
            <hr />
            <div style={{ fontWeight: 700 }}>Grand Total: ₹{summary.grandTotal.toFixed(2)}</div>

            <div style={{ marginTop: 8 }}>
              <label>Tax Rate (%)</label>
              <input type="number" className="input" value={invoice.taxRate} onChange={e => setField("taxRate", Number(e.target.value || 0))} />
            </div>
          </div>
        </section>

        <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
          <button type="submit" disabled={saving}>{saving ? "Saving..." : "Save & Preview"}</button>
          <button type="button" onClick={() => navigate("/admin/invoices")} style={{ background: "#e5e7eb", color: "#111" }}>Cancel</button>
        </div>
      </form>

      <style>{`
        .input { width: 100%; padding: 8px; margin: 6px 0; box-sizing: border-box; border: 1px solid #e5e7eb; border-radius: 6px; }
        button { padding: 8px 12px; border-radius: 6px; cursor: pointer; border: none; background: #0f172a; color: #fff; }
        button[disabled] { opacity: 0.6; cursor: not-allowed; }
      `}</style>
    </div>
  );
}
