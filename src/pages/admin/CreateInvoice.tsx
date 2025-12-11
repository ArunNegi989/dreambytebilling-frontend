// src/pages/admin/CreateInvoice.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import styles from "../../assets/styles/admin/CreateInvoice.module.css";

/** ---- Types ---- */
export interface IItem {
  id: string;
  location: string;
  sacHsn: string;
  specification: string;
  city?: string;
  qty: number;
  startDate?: string;
  endDate?: string;
  rate: number;
  amount: number;
}

/** ---- Helpers ---- */
const newItem = (id: string): IItem => ({
  id,
  location: "",
  sacHsn: "",
  specification: "",
  city: "",
  qty: 1,
  startDate: "",
  endDate: "",
  rate: 0,
  amount: 0,
});

const formatCurrency = (n: number) =>
  `₹${n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

/** Convert number to words (Indian system, limited scope but good for invoices) */
function numberToWords(n: number): string {
  if (n === 0) return "Zero";
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

  function twoDigits(num: number) {
    if (num < 20) return a[num];
    const tens = Math.floor(num / 10);
    const ones = num % 10;
    return b[tens] + (ones ? " " + a[ones] : "");
  }

  function threeDigits(num: number) {
    const hundred = Math.floor(num / 100);
    const rest = num % 100;
    return (
      (hundred ? a[hundred] + " Hundred" + (rest ? " " : "") : "") +
      (rest ? twoDigits(rest) : "")
    );
  }

  // Indian grouping: crore, lakh, thousand, hundred
  const crore = Math.floor(n / 10000000);
  n = n % 10000000;
  const lakh = Math.floor(n / 100000);
  n = n % 100000;
  const thousand = Math.floor(n / 1000);
  n = n % 1000;
  const hundredRest = n; // <1000

  const parts: string[] = [];
  if (crore) parts.push(threeDigits(crore) + " Crore");
  if (lakh) parts.push(threeDigits(lakh) + " Lakh");
  if (thousand) parts.push(threeDigits(thousand) + " Thousand");
  if (hundredRest) parts.push(threeDigits(hundredRest));
  return parts.join(" ");
}

/** ---- Indian states & UTs ----
 * list used in Place of Supply dropdown
 */
const STATES: { code?: string; name: string }[] = [
  { code: "AN", name: "Andaman and Nicobar Islands" },
  { code: "AP", name: "Andhra Pradesh" },
  { code: "AR", name: "Arunachal Pradesh" },
  { code: "AS", name: "Assam" },
  { code: "BR", name: "Bihar" },
  { code: "CH", name: "Chandigarh" },
  { code: "CT", name: "Chhattisgarh" },
  { code: "DN", name: "Dadra and Nagar Haveli and Daman and Diu" },
  { code: "DL", name: "Delhi" },
  { code: "GA", name: "Goa" },
  { code: "GJ", name: "Gujarat" },
  { code: "HR", name: "Haryana" },
  { code: "HP", name: "Himachal Pradesh" },
  { code: "JK", name: "Jammu and Kashmir" },
  { code: "JH", name: "Jharkhand" },
  { code: "KA", name: "Karnataka" },
  { code: "KL", name: "Kerala" },
  { code: "LA", name: "Ladakh" },
  { code: "LD", name: "Lakshadweep" },
  { code: "MP", name: "Madhya Pradesh" },
  { code: "MH", name: "Maharashtra" },
  { code: "MN", name: "Manipur" },
  { code: "ML", name: "Meghalaya" },
  { code: "MZ", name: "Mizoram" },
  { code: "NL", name: "Nagaland" },
  { code: "OR", name: "Odisha" },
  { code: "PY", name: "Puducherry" },
  { code: "PB", name: "Punjab" },
  { code: "RJ", name: "Rajasthan" },
  { code: "SK", name: "Sikkim" },
  { code: "TN", name: "Tamil Nadu" },
  { code: "TG", name: "Telangana" },
  { code: "TR", name: "Tripura" },
  { code: "UP", name: "Uttar Pradesh" },
  { code: "UT", name: "Uttarakhand" },
  { code: "WB", name: "West Bengal" },
];

/** ---- Component ---- */
const CreateInvoice: React.FC = () => {
  const navigate = useNavigate();

  // ---- Top header supplier / office (as on your image) ----
  const [panNo, setPanNo] = useState("AAKCM6690D");
  const [supplierGstin, setSupplierGstin] = useState("05AAKCM6690D1ZC");
  const [category, setCategory] = useState("ADVERTISING AGENCY");

  const [officeEmail, setOfficeEmail] = useState("accounts@media24x7.co");
  const [cin, setCin] = useState("U74999DL2016PTC307034");
  const [msme, setMsme] = useState("UDYAM-UK-05-0002107");
  const [officeAddress, setOfficeAddress] = useState(
    "67/1, Arya Nagar, Block-II, Rajpur Road, Dehradun, Uttarakhand - 248001"
  );
  const [logoUrl, setLogoUrl] = useState<string | null>(null); // you can set a URL or leave null

  // ---- IRN / ACK fields ----
  const [irn, setIrn] = useState("");
  const [ackNo, setAckNo] = useState("");
  const [ackDate, setAckDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );

  // ---- Invoice meta ----
  const [gstin, setGstin] = useState(supplierGstin);
  const [invoiceNo, setInvoiceNo] = useState("");
  const [dateOfInvoice, setDateOfInvoice] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [placeOfSupply, setPlaceOfSupply] = useState<string>("Uttarakhand"); // default example
  const [reverseCharge, setReverseCharge] = useState<"Yes" | "No">("No");
  const [clientOrderNo, setClientOrderNo] = useState("");
  const [orderDate, setOrderDate] = useState<string>("");

  // ---- Billed to / campaign / party info ----
  const [billedToName, setBilledToName] = useState(
    "DREAMBYTE SOLUTIONS (OPC) PRIVATE LIMITED"
  );
  const [billedToAddress, setBilledToAddress] = useState(
    "Shashtradhara Road, Siddharth College, Danda, Khudanewala, Dehradun, Uttarakhand, 248008"
  );

  const [campaign, setCampaign] = useState("Dreambyte");
  const [campaignStart, setCampaignStart] = useState<string>("");
  const [campaignEnd, setCampaignEnd] = useState<string>("");
  const [partyPan, setPartyPan] = useState("");
  // add with your other states
  const [shipToName, setShipToName] = useState("");
  const [shipToAddress, setShipToAddress] = useState("");
  const [sameAsBilling, setSameAsBilling] = useState(false);
  const [sector, setSector] = useState("");
  const [pincode, setPincode] = useState("");

  // placeOfSupply reused above
  const [receiverGstin, setReceiverGstin] = useState("");

  // ---- Items + bank/terms ----
  const [items, setItems] = useState<IItem[]>([newItem("itm-1")]);
  const [bankName, setBankName] = useState("ICICI Ltd");
  const [accountNo, setAccountNo] = useState("025051000008");
  const [ifsc, setIfsc] = useState("ICIC0000250");
  const [branch, setBranch] = useState("Sector-5 Dwarka New Delhi-110075");

  const [saving, setSaving] = useState(false);
  const [topError, setTopError] = useState<string | null>(null);
  const [expandedItem, setExpandedItem] = useState<Record<string, boolean>>({});

  // ---- Items management ----
  const updateItem = (id: string, patch: Partial<IItem>) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        const updated = { ...it, ...patch };
        updated.amount = +(
          Number(updated.qty || 0) * Number(updated.rate || 0)
        );
        return updated;
      })
    );
  };
  // keep shipTo synced when sameAsBilling is true or when billedTo changes
  useEffect(() => {
    if (sameAsBilling) {
      setShipToName(billedToName || "");
      setShipToAddress(billedToAddress || "");
    }
  }, [sameAsBilling, billedToName, billedToAddress]);

  const addItem = () => {
    const id = `itm-${Date.now()}`;
    setItems((p) => [...p, newItem(id)]);
    setExpandedItem((s) => ({ ...s, [id]: true }));
  };

  const removeItem = (id: string) => {
    if (!window.confirm("Remove this item?")) return;
    setItems((p) => p.filter((it) => it.id !== id));
    setExpandedItem((s) => {
      const copy = { ...s };
      delete copy[id];
      return copy;
    });
  };

  // ---- Totals ----
  const subtotal = useMemo(
    () => items.reduce((s, it) => s + (Number(it.amount) || 0), 0),
    [items]
  );
  const igst = 0; // your sample invoice uses CGST + SGST, IGST 0
  const cgst = +(subtotal * 0.09).toFixed(2);
  const sgst = +(subtotal * 0.09).toFixed(2);
  const grandTotal = +(subtotal + igst + cgst + sgst).toFixed(2);

  // ---- Validation ----
  const validateQuick = (): string | null => {
    if (!invoiceNo.trim()) return "Invoice No required";
    if (!dateOfInvoice) return "Invoice date required";
    if (!billedToName.trim()) return "Billed to name required";
    if (!items.length) return "Add at least one line item";
    for (const it of items) {
      if (!it.location.trim()) return "Each item needs Location";
      if (!it.sacHsn.trim()) return "Each item needs SAC/HSN";
      if (!it.specification.trim()) return "Each item needs Specification";
      if (it.qty <= 0) return "Qty must be > 0";
    }
    return null;
  };
  const quickError = useMemo(
    () => validateQuick(),
    [invoiceNo, dateOfInvoice, billedToName, items]
  );

  // ---- Submit handler ----
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setTopError(null);
    const v = validateQuick();
    if (v) {
      setTopError(v);
      const bad = items.find(
        (it) => !it.location || !it.sacHsn || !it.specification || it.qty <= 0
      );
      if (bad) setExpandedItem((s) => ({ ...s, [bad.id]: true }));
      return;
    }

    const payload = {
      header: {
        panNo,
        supplierGstin,
        category,
        office: { officeEmail, cin, msme, officeAddress },
        logoUrl,
      },
      irn,
      ackNo,
      ackDate,
      gstin,
      invoiceNo,
      dateOfInvoice,
      placeOfSupply,
      reverseCharge,
      clientOrderNo,
      orderDate,
      billedTo: { name: billedToName, address: billedToAddress },
      campaign: { name: campaign, start: campaignStart, end: campaignEnd },
      partyPan,
      receiverGstin,
      items,
      totals: { subtotal, igst, cgst, sgst, grandTotal },
      amountInWords: numberToWords(Math.floor(grandTotal)) + " Rupees Only",
      bank: { bankName, accountNo, ifsc, branch },
      footerAddress: officeAddress,
    };

    try {
      setSaving(true);
      if (api) {
        await api.post("/invoices", payload);
      } else {
        await fetch("/api/invoices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      navigate("/admin/invoices");
    } catch (err: any) {
      console.error(err);
      setTopError(err?.message || "Failed to save invoice");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* LEFT COLUMN - form */}
      <div className={styles.left}>
        {/* Top header area mimicking invoice header */}
        <div className={styles.invoiceHeaderCard}>
          <div className={styles.headerLeft}>
            <div className={styles.smallLabel}>PAN NO.</div>
            <input
              className={styles.headerInput}
              value={panNo}
              onChange={(e) => setPanNo(e.target.value)}
            />
            <div className={styles.smallLabel}>GSTIN</div>
            <input
              className={styles.headerInput}
              value={supplierGstin}
              onChange={(e) => setSupplierGstin(e.target.value)}
            />
            <div className={styles.smallLabel}>CATEGORY</div>
            <input
              className={styles.headerInput}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          <div className={styles.headerCenter}>
            {logoUrl ? (
              <img src={logoUrl} alt="logo" style={{ maxHeight: 72 }} />
            ) : (
              <div className={styles.logoPlaceholder}>
                Dream Byte solutions
                <br />
                Advertising Pvt. Ltd.
              </div>
            )}
          </div>

          <div className={styles.headerRight}>
            <div className={styles.smallLabel}>E-mail</div>
            <input
              className={styles.headerInput}
              value={officeEmail}
              onChange={(e) => setOfficeEmail(e.target.value)}
            />
            <div className={styles.smallLabel}>CIN</div>
            <input
              className={styles.headerInput}
              value={cin}
              onChange={(e) => setCin(e.target.value)}
            />
            <div className={styles.smallLabel}>MSME</div>
            <input
              className={styles.headerInput}
              value={msme}
              onChange={(e) => setMsme(e.target.value)}
            />
            <div style={{ height: 6 }} />
            <textarea
              className={styles.headerAddress}
              value={officeAddress}
              onChange={(e) => setOfficeAddress(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* Action header */}
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Create Invoice</h1>
            <p className={styles.subtitle}>
              Fill fields exactly as the attached invoice.
            </p>
          </div>

          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.ghost}
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
            <button
              type="button"
              className={styles.primary}
              onClick={handleSubmit}
              disabled={!!quickError || saving}
              title={quickError ?? "Save invoice"}
            >
              {saving ? "Saving..." : "Save & Generate"}
            </button>
          </div>
        </header>

        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
          {/* IRN / ACK block */}
          <section className={styles.card}>
            <div className={styles.metaRow}>
              <label>
                <div className={styles.label}>IRN</div>
                <input value={irn} onChange={(e) => setIrn(e.target.value)} />
              </label>

              <label>
                <div className={styles.label}>Ack No</div>
                <input
                  value={ackNo}
                  onChange={(e) => setAckNo(e.target.value)}
                />
              </label>

              <label>
                <div className={styles.label}>Ack Date</div>
                <input
                  type="date"
                  value={ackDate}
                  onChange={(e) => setAckDate(e.target.value)}
                />
              </label>
            </div>
          </section>
          <section className={styles.card}>
            <div className={styles.metaRow}>
              <label>
                <div className={styles.label}>GSTIN</div>
                <input
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                />
              </label>

              <label>
                <div className={styles.label}>Invoice No</div>
                <input
                  value={invoiceNo}
                  onChange={(e) => setInvoiceNo(e.target.value)}
                />
              </label>

              <label>
                <div className={styles.label}>Date of Invoice</div>
                <input
                  type="date"
                  value={dateOfInvoice}
                  onChange={(e) => setDateOfInvoice(e.target.value)}
                />
              </label>
            </div>

            <div className={styles.metaRow}>
              <label>
                <div className={styles.label}>Place of Supply</div>

                {/* <-- SELECT DROPDOWN WITH ALL INDIAN STATES/UTs --> */}
                <select
                  value={placeOfSupply}
                  onChange={(e) => setPlaceOfSupply(e.target.value)}
                  style={{
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: "1px solid #e6e6e6",
                    background: "#fff",
                    color: "#111",
                  }}
                >
                  <option value="">-- Select State / Union Territory --</option>
                  {STATES.map((s) => (
                    <option key={s.name} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <div className={styles.label}>Reverse Charge</div>
                <select
                  value={reverseCharge}
                  onChange={(e) =>
                    setReverseCharge(e.target.value as "Yes" | "No")
                  }
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </label>

              <label>
                <div className={styles.label}>Client Order No</div>
                <input
                  value={clientOrderNo}
                  onChange={(e) => setClientOrderNo(e.target.value)}
                />
              </label>

              <label>
                <div className={styles.label}>Order Date</div>
                <input
                  type="date"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                />
              </label>
            </div>
          </section>

          {/* Billed to / ship to / campaign block — improved layout */}
          <section className={styles.card}>
            <div className={styles.billingSection}>
              {/* LEFT: Billed To */}
              <div className={styles.columnLeft}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionTitle}>Billed To</div>
                  <div className={styles.sectionSubtitle}>
                    Enter billing details here
                  </div>
                </div>

                <label className={styles.formField}>
                  <input
                    className={styles.textInput}
                    value={billedToName}
                    onChange={(e) => setBilledToName(e.target.value)}
                    placeholder="Billed to name"
                  />
                </label>

                <label
                  className={`${styles.formField} ${styles.textareaField}`}
                >
                  <textarea
                    className={styles.textarea}
                    rows={3}
                    value={billedToAddress}
                    onChange={(e) => setBilledToAddress(e.target.value)}
                    placeholder="Billed to address"
                  />
                </label>

                <div className={styles.rowGrid}>
                  <div>
                    <div className={styles.label}>Campaign</div>
                    <input
                      className={styles.textInput}
                      value={campaign}
                      onChange={(e) => setCampaign(e.target.value)}
                    />
                  </div>

                  <div>
                    <div className={styles.label}>Campaign Duration</div>
                    <div className={styles.inlineDates}>
                      <input
                        className={styles.smallDate}
                        type="date"
                        value={campaignStart}
                        onChange={(e) => setCampaignStart(e.target.value)}
                      />
                      <input
                        className={styles.smallDate}
                        type="date"
                        value={campaignEnd}
                        onChange={(e) => setCampaignEnd(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: Ship To + Party PAN / Place of Supply / Receiver GSTIN */}
              <div className={styles.columnRight}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionTitle}>Ship To</div>

                  <label className={styles.sameAsBilling}>
                    <input
                      type="checkbox"
                      checked={sameAsBilling}
                      onChange={(e) => setSameAsBilling(e.target.checked)}
                    />
                    <span>Same as Billing</span>
                  </label>
                </div>

                <label className={styles.formField}>
                  <input
                    className={styles.textInput}
                    value={shipToName}
                    onChange={(e) => {
                      setShipToName(e.target.value);
                      if (sameAsBilling) setSameAsBilling(false);
                    }}
                    placeholder="Ship to name"
                    disabled={sameAsBilling}
                  />
                </label>

                <label
                  className={`${styles.formField} ${styles.textareaField}`}
                >
                  <textarea
                    className={styles.textarea}
                    rows={3}
                    value={shipToAddress}
                    onChange={(e) => {
                      setShipToAddress(e.target.value);
                      if (sameAsBilling) setSameAsBilling(false);
                    }}
                    placeholder="Ship to address"
                    disabled={sameAsBilling}
                  />
                </label>

                <label className={styles.formField}>
                  <div className={styles.label}>Party PAN</div>
                  <input
                    className={styles.textInput}
                    value={partyPan}
                    onChange={(e) => setPartyPan(e.target.value)}
                    placeholder="Party PAN"
                  />
                </label>

                <div className={styles.rowGrid} style={{ marginTop: 6 }}>
                  <label style={{ flex: 1 }}>
                    <div className={styles.label}>Place of Supply</div>
                    <select
                      value={placeOfSupply}
                      onChange={(e) => setPlaceOfSupply(e.target.value)}
                      className={styles.textInput}
                    >
                      <option value="">
                        -- Select State / Union Territory --
                      </option>
                      {STATES.map((s) => (
                        <option key={s.name} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label style={{ width: 200 }}>
                    <div className={styles.label}>Receiver's GSTIN</div>
                    <input
                      className={styles.textInput}
                      value={receiverGstin}
                      onChange={(e) => setReceiverGstin(e.target.value)}
                      placeholder="Receiver GSTIN"
                    />
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* heading "towards charges..." */}
          <section className={styles.card}>
            <div
              className={styles.itemTableheading}
              style={{ fontWeight: 700, marginBottom: 8 }}
            >
              Towards charges for sale of advertising space in outdoor media as
              per following details:
            </div>

            {/* Items table */}
            <div className={styles.itemsTable}>
              {/* ---- TABLE HEADER ---- */}
              <div className={styles.itemsGridHeader}>
                <div>S.N.</div>
                <div>Location</div>
                <div>SAC/HSN</div>
                <div>Qty</div>
                <div>Note</div>
                <div>Rate (PM/SQFT)</div>
                <div>Amount</div>
                <div />
              </div>

              {/* ---- TABLE ROWS ---- */}
              {items.map((it, idx) => {
                const isInvalid =
                  !it.location.trim() ||
                  !it.sacHsn.trim() ||
                  !it.specification.trim() ||
                  it.qty <= 0;

                return (
                  <div
                    key={it.id}
                    className={`${styles.itemRow} ${
                      isInvalid ? styles.invalidRow : ""
                    }`}
                  >
                    <div className={styles.itemIndex}>{idx + 1}</div>

                    {/* Location */}
                    <input
                      className={styles.itemSmall}
                      placeholder="Location"
                      value={it.location}
                      onChange={(e) =>
                        updateItem(it.id, { location: e.target.value })
                      }
                    />

                    {/* SAC/HSN */}
                    <input
                      className={styles.itemSmall}
                      placeholder="SAC/HSN"
                      value={it.sacHsn}
                      onChange={(e) =>
                        updateItem(it.id, { sacHsn: e.target.value })
                      }
                    />

                    {/* Qty */}
                    <input
                      type="number"
                      min={1}
                      className={styles.itemQty}
                      placeholder="Qty"
                      value={it.qty}
                      onChange={(e) =>
                        updateItem(it.id, { qty: Number(e.target.value) || 0 })
                      }
                    />

                    {/* Note / Description */}
                    <input
                      className={styles.itemDesc}
                      placeholder="Enter Note"
                      value={it.specification}
                      onChange={(e) =>
                        updateItem(it.id, { specification: e.target.value })
                      }
                    />

                    {/* Rate */}
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      className={styles.itemRate}
                      placeholder="Rate"
                      value={it.rate}
                      onChange={(e) =>
                        updateItem(it.id, { rate: Number(e.target.value) || 0 })
                      }
                    />

                    {/* Amount */}
                    <div className={styles.itemAmount}>
                      {formatCurrency(it.amount || 0)}
                    </div>

                    {/* Actions */}
                    <div className={styles.itemActionsCell}>
                      <button
                        type="button"
                        className={styles.removeSmall}
                        onClick={() => removeItem(it.id)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* ---- ADD BUTTON ---- */}
              <div style={{ marginTop: 8 }}>
                <button
                  type="button"
                  className={styles.addBtn}
                  onClick={addItem}
                >
                  + Add Item
                </button>
              </div>
            </div>
          </section>

          {/* Display charges area & totals words */}
          <section className={styles.card}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>DISPLAY CHARGES</div>
                <div style={{ marginTop: 10, color: "#555" }}>
                  Rupees in words:{" "}
                  <strong>{numberToWords(Math.floor(grandTotal))} Only</strong>
                </div>
              </div>

              <div style={{ minWidth: 260, textAlign: "right", color: "#000" }}>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <div>Total Taxable Value:</div>
                  <div>{formatCurrency(subtotal)}</div>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <div>IGST @18%:</div>
                  <div>{formatCurrency(igst)}</div>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <div>CGST @9%:</div>
                  <div>{formatCurrency(cgst)}</div>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <div>SGST @9%:</div>
                  <div>{formatCurrency(sgst)}</div>
                </div>
                <div
                  style={{
                    borderTop: "1px solid #050505ff",
                    marginTop: 8,
                    paddingTop: 8,
                    fontWeight: 700,
                    color: "#000",
                  }}
                >
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <div>Grand Total</div>
                    <div>{formatCurrency(grandTotal)}</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Bank, Terms & Receiver signature */}
          <section className={styles.card}>
            <div className={styles.row}>
              {/* LEFT: Editable Bank Fields */}
              <div style={{ flex: 1 }}>
                <div
                  style={{ fontWeight: 700, marginBottom: 12, color: "#000" }}
                >
                  Our Bank Details
                </div>

                <div className={styles.bankGrid}>
                  <label>
                    <div className={styles.label}>Bank Name</div>
                    <input
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="Enter Bank Name"
                    />
                  </label>

                  <label>
                    <div className={styles.label}>A/C Number</div>
                    <input
                      value={accountNo}
                      onChange={(e) => setAccountNo(e.target.value)}
                      placeholder="Enter Account Number"
                    />
                  </label>

                  <label>
                    <div className={styles.label}>IFSC Code</div>
                    <input
                      value={ifsc}
                      onChange={(e) => setIfsc(e.target.value)}
                      placeholder="Enter IFSC Code"
                    />
                  </label>

                  <label>
                    <div className={styles.label}>Branch</div>
                    <input
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      placeholder="Enter Branch Name"
                    />
                  </label>

                  <label>
                    <div className={styles.label}>Sector</div>
                    <input
                      value={sector}
                      onChange={(e) => setSector(e.target.value)}
                      placeholder="Enter Sector"
                    />
                  </label>

                  <label>
                    <div className={styles.label}>Pincode</div>
                    <input
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="Enter Pincode"
                    />
                  </label>
                </div>
              </div>

              {/* RIGHT: Receiver Signature */}
            </div>
          </section>

          {topError && <div className={styles.formError}>{topError}</div>}
        </form>
      </div>

      {/* RIGHT COLUMN - sticky summary */}
      <aside className={styles.right}>
        <div className={styles.summaryCard}>
          <h3>Summary</h3>
          <div className={styles.summaryRow}>
            <div>Subtotal</div>
            <div>{formatCurrency(subtotal)}</div>
          </div>
          <div className={styles.summaryRow}>
            <div>IGST @18%</div>
            <div>{formatCurrency(igst)}</div>
          </div>
          <div className={styles.summaryRow}>
            <div>CGST @9%</div>
            <div>{formatCurrency(cgst)}</div>
          </div>
          <div className={styles.summaryRow}>
            <div>SGST @9%</div>
            <div>{formatCurrency(sgst)}</div>
          </div>

          <div className={styles.summaryTotal}>
            <div>Grand Total</div>
            <div className={styles.big}>{formatCurrency(grandTotal)}</div>
          </div>

          <div className={styles.summaryActions}>
            <button
              type="button"
              className={styles.primaryFull}
              onClick={handleSubmit}
              disabled={!!quickError || saving}
            >
              {saving ? "Saving..." : "Save & Generate"}
            </button>
            <button
              type="button"
              className={styles.ghostFull}
              onClick={() => window.print()}
            >
              Print Preview
            </button>
          </div>

          {quickError && <div className={styles.smallHint}>⚠ {quickError}</div>}
        </div>
      </aside>
    </div>
  );
};

export default CreateInvoice;
