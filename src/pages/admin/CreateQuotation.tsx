import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import styles from "../../assets/styles/admin/CreateInvoice.module.css";

/* ---------------- TYPES ---------------- */
interface Item {
  id: string;
  Services: string;
  sacHsn: string;
  specification: string;
  qty: number;
  rate: number;
  amount: number;
}

/* ---------------- HELPERS ---------------- */
const emptyItem = (): Item => ({
  id: crypto.randomUUID(),
  Services: "",
  sacHsn: "",
  specification: "",
  qty: 1,
  rate: 0,
  amount: 0,
});

const formatCurrency = (n = 0) =>
  `₹${n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

/* ---------------- COMPONENT ---------------- */
export default function CreateQuotation() {
  const { id } = useParams(); // for edit
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  /* ---------------- FORM STATE ---------------- */
  const [invoiceNo, setInvoiceNo] = useState("");
  const [dateOfInvoice, setDateOfInvoice] = useState("");
  const [placeOfSupply, setPlaceOfSupply] = useState("");

  const [billedTo, setBilledTo] = useState({
    name: "",
    address: "",
  });

  const [items, setItems] = useState<Item[]>([emptyItem()]);

  /* ---------------- CALCULATIONS ---------------- */
  const subtotal = useMemo(
    () => items.reduce((s, i) => s + i.amount, 0),
    [items]
  );

  const cgst = +(subtotal * 0.09).toFixed(2);
  const sgst = +(subtotal * 0.09).toFixed(2);
  const grandTotal = +(subtotal + cgst + sgst).toFixed(2);

  /* ---------------- FETCH (EDIT MODE) ---------------- */
  const fetchQuotation = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await api.get(`/api/invoice/${id}`);
      const q = res.data;

      setInvoiceNo(q.invoiceNo || "");
      setDateOfInvoice(q.dateOfInvoice?.slice(0, 10) || "");
      setPlaceOfSupply(q.placeOfSupply || "");
      setBilledTo(q.billedTo || { name: "", address: "" });
      setItems(q.items?.length ? q.items : [emptyItem()]);
    } catch {
      alert("Failed to load quotation");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotation();
  }, [id]);

  /* ---------------- ITEM HANDLERS ---------------- */
  const updateItem = (idx: number, field: keyof Item, value: any) => {
    setItems((prev) =>
      prev.map((it, i) =>
        i === idx
          ? {
              ...it,
              [field]: value,
              amount:
                field === "qty" || field === "rate"
                  ? Number(
                      (field === "qty" ? value : it.qty) *
                        (field === "rate" ? value : it.rate)
                    )
                  : it.amount,
            }
          : it
      )
    );
  };

  const addItem = () => setItems((p) => [...p, emptyItem()]);
  const removeItem = (idx: number) =>
    setItems((p) => p.filter((_, i) => i !== idx));

  /* ---------------- SAVE ---------------- */
  const saveQuotation = async () => {
    try {
      setSaving(true);

      const payload = {
        invoiceNo,
        dateOfInvoice,
        placeOfSupply,
        billedTo,
        items,
        totals: { subtotal, cgst, sgst, grandTotal },
      };

      if (id) {
        await api.put(`/api/invoice/${id}`, payload);
      } else {
        await api.post("/api/invoice", payload);
      }

      navigate("/admin/quotations");
    } catch {
      alert("Failed to save quotation");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  /* ---------------- UI ---------------- */
  return (
    <div >
      <div className={styles.left}>
        {/* HEADER */}
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>
              {id ? "Edit Quotation" : "Create Quotation"}
            </h1>
            <p className={styles.subtitle}>Quotation details</p>
          </div>

          <div className={styles.headerActions}>
            <button
              className={styles.ghost}
              onClick={() => navigate(-1)}
            >
              Back
            </button>
            <button
              className={styles.primary}
              disabled={saving}
              onClick={saveQuotation}
            >
              {saving ? "Saving..." : "Save Quotation"}
            </button>
          </div>
        </header>

        {/* META */}
        <section className={styles.card}>
          <div className={styles.metaRow}>
            <label>
              <div className={styles.label}>Quotation No</div>
              <input
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
              />
            </label>
          </div>

          <div className={styles.metaRow}>
            <label>
              <div className={styles.label}>Date</div>
              <input
                type="date"
                value={dateOfInvoice}
                onChange={(e) => setDateOfInvoice(e.target.value)}
              />
            </label>

            <label>
              <div className={styles.label}>Place of Supply</div>
              <input
                value={placeOfSupply}
                onChange={(e) => setPlaceOfSupply(e.target.value)}
              />
            </label>
          </div>
        </section>

        {/* BILLED TO */}
        <section className={styles.card}>
          <div className={styles.sectionTitle}>Billed To</div>

          <input
            className={styles.textInput}
            placeholder="Client Name"
            value={billedTo.name}
            onChange={(e) =>
              setBilledTo({ ...billedTo, name: e.target.value })
            }
          />

          <textarea
            className={styles.textarea}
            rows={3}
            placeholder="Address"
            value={billedTo.address}
            onChange={(e) =>
              setBilledTo({ ...billedTo, address: e.target.value })
            }
          />
        </section>

        {/* ITEMS */}
        <section className={styles.card}>
          <div className={styles.itemsTable}>
            <div className={styles.itemsGridHeader}>
              <div>S.N.</div>
              <div>Service</div>
              <div>SAC/HSN</div>
              <div>Qty</div>
              <div>Description</div>
              <div>Rate</div>
              <div>Amount</div>
              <div />
            </div>

            {items.map((it, idx) => (
              <div key={it.id} className={styles.itemRow}>
                <div>{idx + 1}</div>
                <input
                  value={it.Services}
                  onChange={(e) =>
                    updateItem(idx, "Services", e.target.value)
                  }
                />
                <input
                  value={it.sacHsn}
                  onChange={(e) =>
                    updateItem(idx, "sacHsn", e.target.value)
                  }
                />
                <input
                  type="number"
                  value={it.qty}
                  onChange={(e) =>
                    updateItem(idx, "qty", +e.target.value)
                  }
                />
                <input
                  value={it.specification}
                  onChange={(e) =>
                    updateItem(idx, "specification", e.target.value)
                  }
                />
                <input
                  type="number"
                  value={it.rate}
                  onChange={(e) =>
                    updateItem(idx, "rate", +e.target.value)
                  }
                />
                <div>{formatCurrency(it.amount)}</div>
                <button
                  className={styles.ghost}
                  onClick={() => removeItem(idx)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <button className={styles.primary} onClick={addItem}>
            + Add Item
          </button>
        </section>

        {/* TOTALS */}
        <section className={styles.card}>
          <div>Total: {formatCurrency(subtotal)}</div>
          <div>CGST: {formatCurrency(cgst)}</div>
          <div>SGST: {formatCurrency(sgst)}</div>
          <div style={{ fontWeight: 700 }}>
            Grand Total: {formatCurrency(grandTotal)}
          </div>
        </section>
      </div>
    </div>
  );
}
