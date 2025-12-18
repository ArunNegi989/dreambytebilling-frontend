import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../../api/axios";
import styles from "../../../assets/styles/admin/CreateQuatation.module.css";

/* ---------- TYPES ---------- */
interface Item {
  id: string;
  service: string;
  rate: number | "";
  amount: number;
}

/* ---------- HELPERS ---------- */
const emptyItem = (): Item => ({
  id: crypto.randomUUID(),
  service: "",
  rate: "",
  amount: 0,
});

const formatCurrency = (n = 0) =>
  `₹${n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const numberToWords = (num: number): string => {
  if (num === 0) return "Zero";

  const a = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const b = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const inWords = (n: number): string => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
    if (n < 1000)
      return (
        a[Math.floor(n / 100)] +
        " Hundred" +
        (n % 100 ? " " + inWords(n % 100) : "")
      );
    if (n < 100000)
      return (
        inWords(Math.floor(n / 1000)) +
        " Thousand" +
        (n % 1000 ? " " + inWords(n % 1000) : "")
      );
    if (n < 10000000)
      return (
        inWords(Math.floor(n / 100000)) +
        " Lakh" +
        (n % 100000 ? " " + inWords(n % 100000) : "")
      );
    return (
      inWords(Math.floor(n / 10000000)) +
      " Crore" +
      (n % 10000000 ? " " + inWords(n % 10000000) : "")
    );
  };

  return inWords(Math.floor(num));
};

/* ---------- COMPONENT ---------- */
export default function CreateQuotation() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [quotationNo, setQuotationNo] = useState("");
  const [quotationDate, setQuotationDate] = useState("");
  const [clientName, setClientName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [billToAddress, setBillToAddress] = useState("");

  const [items, setItems] = useState<Item[]>([emptyItem()]);

  const totalAmount = useMemo(
    () => items.reduce((sum, i) => sum + Number(i.amount || 0), 0),
    [items]
  );

  const rupeesInWords =
    totalAmount > 0 ? `${numberToWords(totalAmount)} Rupees Only` : "";

  /* ---------- FETCH (EDIT MODE) ---------- */
  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/quotation/getquotationbyid/${id}`);
        const q = res.data;

        setQuotationNo(q.quotationNo || "");
        setQuotationDate(q.quotationDate?.slice(0, 10) || "");
        setClientName(q.clientName || "");
        setContactNumber(q.contactNumber || "");
        setEmail(q.email || "");
        setBillToAddress(q.billToAddress || "");
        setItems(q.items?.length ? q.items : [emptyItem()]);
      } catch {
        toast.error("Failed to load quotation");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  /* ---------- ITEM HANDLERS ---------- */
  const updateItem = (idx: number, field: keyof Item, value: any) => {
    setItems((prev) =>
      prev.map((it, i) => {
        if (i !== idx) return it;
        const rate = field === "rate" ? Number(value) : Number(it.rate);
        return { ...it, [field]: value, amount: rate };
      })
    );
  };

  const addItem = () => setItems((p) => [...p, emptyItem()]);
  const removeItem = (idx: number) =>
    setItems((p) => p.filter((_, i) => i !== idx));

  /* ---------- SAVE ---------- */
  const saveQuotation = async () => {
    if (!quotationNo || !clientName || !billToAddress) {
      toast.warning("Please fill required fields");
      return;
    }

    const validItems = items.filter((i) => i.service && Number(i.rate) > 0);

    if (!validItems.length) {
      toast.warning("Please add at least one service");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        quotationNo,
        quotationDate,
        clientName,
        contactNumber,
        email,
        billToAddress,
        items: validItems,
        totals: { totalAmount },
      };

      if (id) {
        await api.put(`/api/quotation/updatequtation/${id}`, payload);
        toast.success("Quotation updated successfully");
      } else {
        await api.post("/api/quotation/createquotation", payload);
        toast.success("Quotation created successfully");
      }

      navigate("/admin/quotation");
    } catch {
      toast.error("Failed to save quotation");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  /* ---------- UI ---------- */
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>{id ? "Edit Quotation" : "Create Quotation"}</h1>
        <div className={styles.headerBtns}>
          <button onClick={() => navigate(-1)}>Back</button>
          <button onClick={saveQuotation} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </header>

      <section className={styles.card}>
        <div className={styles.row}>
          <input
            placeholder="Quotation No"
            value={quotationNo}
            onChange={(e) => setQuotationNo(e.target.value)}
          />
          <input
            placeholder="Client Name"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
          />
          <input
            placeholder="Contact Number"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
          />
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="date"
            value={quotationDate}
            onChange={(e) => setQuotationDate(e.target.value)}
          />
        </div>
      </section>

      <section className={styles.card}>
        <textarea
          rows={4}
          placeholder="Billing Address"
          value={billToAddress}
          onChange={(e) => setBillToAddress(e.target.value)}
        />
      </section>

      <section className={styles.card}>
        <div className={styles.itemsHeader}>
          <span>#</span>
          <span>Service</span>
          <span>Rate</span>
          <span>Amount</span>
          <span />
        </div>

        {items.map((it, idx) => (
          <div key={it.id} className={styles.itemRow}>
            <span>{idx + 1}</span>
            <input
              value={it.service}
              placeholder="Service"
              onChange={(e) => updateItem(idx, "service", e.target.value)}
            />
            <input
              type="number"
              placeholder="Rate"
              value={it.rate}
              onChange={(e) => updateItem(idx, "rate", e.target.value)}
            />
            <span>{formatCurrency(it.amount)}</span>
            <button onClick={() => removeItem(idx)}>✕</button>
          </div>
        ))}

        <button onClick={addItem}>+ Add Service</button>
      </section>

      <section className={styles.card}>
        <p>
          <strong>Rupees in words:</strong> {rupeesInWords}
        </p>

        <div className={styles.total}>
          <span>Grand Total</span>
          <span>{formatCurrency(totalAmount)}</span>
        </div>

        <div className={styles.bottomActions}>
          <button onClick={() => navigate(-1)}>Back</button>
          <button onClick={saveQuotation} disabled={saving}>
            {saving ? "Saving..." : "Save Quotation"}
          </button>
        </div>
      </section>
    </div>
  );
}
