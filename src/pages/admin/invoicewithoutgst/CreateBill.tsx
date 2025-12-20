// src/pages/admin/CreateInvoice.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "../../../assets/styles/admin/CreateInvoice.module.css";
import { toast } from "react-toastify";
import api from "../../../api/axios";

/** ---- Types ---- */
export interface IItem {
  id: string;
  Services: string;
  serviceCategory: string;
  sacHsn: string;
  specification: string;
  qty: number;
  rate: number;
  amount: number;
}

/** ---- Helpers ---- */
const newItem = (id: string): IItem => ({
  id,
  Services: "",
  serviceCategory: "",
  sacHsn: "",
  specification: "",
  qty: 1,
  rate: 0,
  amount: 0,
});

const formatCurrency = (n: number) =>
  `₹${n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

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
  const crore = Math.floor(n / 10000000);
  n = n % 10000000;
  const lakh = Math.floor(n / 100000);
  n = n % 100000;
  const thousand = Math.floor(n / 1000);
  n = n % 1000;
  const hundredRest = n;
  const parts: string[] = [];
  if (crore) parts.push(threeDigits(crore) + " Crore");
  if (lakh) parts.push(threeDigits(lakh) + " Lakh");
  if (thousand) parts.push(threeDigits(thousand) + " Thousand");
  if (hundredRest) parts.push(threeDigits(hundredRest));
  return parts.join(" ");
}

const CreateBill: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // bill id from URL
  const isEdit = !!id;

  /** ---- FORM STATE (only what goes in payload) ---- */
  // header
  const [panNo, setPanNo] = useState("AAKCD5928M");
  const [supplierGstin, setSupplierGstin] = useState("05AAKCD5928M1Z7");
  const [category, setCategory] = useState("MARKETING AGENCY");
  const [personalPhone, setPersonalPhone] = useState("8279720490");
  const [alternatePhone, setAlternatePhone] = useState("9258332639");
  const [officeEmail, setOfficeEmail] = useState("info@dreambytesolution.com");
  const [cin, setCin] = useState("UC3122UT20240PC01C799");
  const [msme, setMsme] = useState("UDYAM-UK-05-0057194");
  const [officeAddress, setOfficeAddress] = useState(
    "Dream Byte Solutions Pvt. Ltd 3rd Floor, above Bank of India, Sahastradhara Road, Near IT Park,Dehradun, Uttarakhand"
  );

  // invoice meta
  const [gstin, setGstin] = useState(supplierGstin);
  const [dateOfInvoice, setDateOfInvoice] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );

  // billed / shipped
  const [billedToName, setBilledToName] = useState(
    "DREAMBYTE SOLUTIONS (OPC) PRIVATE LIMITED"
  );
  const [billedToAddress, setBilledToAddress] = useState(
    "Shashtradhara Road, Siddharth College, Danda, Khudanewala, Dehradun, Uttarakhand, 248008"
  );
  const [shipToName, setShipToName] = useState("");
  const [shipToAddress, setShipToAddress] = useState("");
  const [sameAsBilling, setSameAsBilling] = useState(false);
  const [pincode, setPincode] = useState("248013");
  const [receiverGstin, setReceiverGstin] = useState("");

  // items
  const [items, setItems] = useState<IItem[]>([newItem("itm-1")]);

  // bank
  const [bankName, setBankName] = useState("Punjab National Bank");
  const [accountNo, setAccountNo] = useState("4925002100003174");
  const [ifsc, setIfsc] = useState("PUNB0492500");
  const [branch, setBranch] = useState("Sahastradhara Road");

  // ui
  const [saving, setSaving] = useState(false);
  const [topError, setTopError] = useState<string | null>(null);

  /** ---- COPY BILLING TO SHIPPING ---- */
  useEffect(() => {
    if (sameAsBilling) {
      setShipToName(billedToName || "");
      setShipToAddress(billedToAddress || "");
    }
  }, [sameAsBilling, billedToName, billedToAddress]);

  /** ---- EDIT MODE: load bill by id ---- */
  useEffect(() => {
    if (!isEdit || !id) return;

    const fetchBill = async () => {
      try {
        const resp = await api.get(`/api/bill/getbillbyid/${id}`);
        const bill = resp.data;

        // Header
        setPanNo(bill.header?.panNo || "");
        setSupplierGstin(bill.header?.supplierGstin || "");
        setCategory(bill.header?.category || "");
        setOfficeEmail(bill.header?.office?.officeEmail || "");
        setPersonalPhone(bill.header?.office?.personalPhone || "");
        setAlternatePhone(bill.header?.office?.alternatePhone || "");
        setCin(bill.header?.office?.cin || "");
        setMsme(bill.header?.office?.msme || "");
        setOfficeAddress(bill.header?.office?.officeAddress || "");

        // Invoice meta
        setGstin(bill.gstin || bill.header?.supplierGstin || "");
        setDateOfInvoice(
          bill.dateOfInvoice
            ? bill.dateOfInvoice.slice(0, 10)
            : new Date(bill.createdAt || Date.now())
                .toISOString()
                .slice(0, 10)
        );

        // Billed / Ship
        setBilledToName(bill.billedTo?.name || "");
        setBilledToAddress(bill.billedTo?.address || "");
        setShipToName(bill.shipTo?.name || "");
        setShipToAddress(bill.shipTo?.address || "");
        setReceiverGstin(bill.receiverGstin || "");

        // Items
        if (bill.items && bill.items.length) {
          setItems(
            bill.items.map((it: any, idx: number) => ({
              id: `itm-${idx + 1}`,
              Services: it.Services || "",
              sacHsn: it.sacHsn || "",
              specification: it.specification || "",
              qty: it.qty || 0,
              rate: it.rate || 0,
              amount: it.amount || 0,
            }))
          );
        } else {
          setItems([newItem("itm-1")]);
        }

        // Bank
        setBankName(bill.bank?.bankName || "");
        setAccountNo(bill.bank?.accountNo || "");
        setIfsc(bill.bank?.ifsc || "");
        setBranch(bill.bank?.branch || "");
        setPincode(bill.bank?.pincode || "");
      } catch (err: any) {
        console.error("Failed to load bill for edit", err);
        toast.error(
          err?.response?.data?.message || "Failed to load bill for editing"
        );
        navigate("/admin/bill");
      }
    };

    fetchBill();
  }, [isEdit, id, navigate]);

  /** ---- ITEMS HANDLERS ---- */
  const updateItem = (id: string, patch: Partial<IItem>) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        const updated = { ...it, ...patch };
        updated.amount = Number(updated.qty || 0) * Number(updated.rate || 0);
        return updated;
      })
    );
  };

  const addItem = () => {
    const id = `itm-${Date.now()}`;
    setItems((p) => [...p, newItem(id)]);
  };

  const removeItem = (id: string) => {
    if (!window.confirm("Remove this item?")) return;
    setItems((p) => p.filter((it) => it.id !== id));
  };

  /** ---- TOTALS ---- */
  const subtotal = useMemo(
    () => items.reduce((s, it) => s + (Number(it.amount) || 0), 0),
    [items]
  );
  const grandTotal = +subtotal.toFixed(2);

  /** ---- VALIDATION ---- */
  const validateQuick = (): string | null => {
    if (!billedToName.trim()) return "Billed to name required";
    if (!items.length) return "Add at least one line item";
    for (const it of items) {
      if (!it.Services.trim()) return "Each item needs Services";
      if (!it.sacHsn.trim()) return "Each item needs SAC/HSN";
      if (!it.specification.trim()) return "Each item needs Specification";
      if (it.qty <= 0) return "Qty must be > 0";
    }
    return null;
  };

  const quickError = useMemo(
    () => validateQuick(),
    [dateOfInvoice, billedToName, items]
  );

  /** ---- SUBMIT ---- */
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setTopError(null);

    const v = validateQuick();
    if (v) {
      setTopError(v);
      return;
    }

    try {
      setSaving(true);

      const preparedItems = items.map((it) => ({
        Services: it.Services,
        sacHsn: it.sacHsn,
        specification: it.specification,
        qty: Number(it.qty),
        rate: Number(it.rate),
        amount: Number((Number(it.qty) * Number(it.rate)).toFixed(2)),
      }));

      const payload = {
        header: {
          panNo,
          supplierGstin,
          category,
          office: {
            officeEmail,
            personalPhone,
            alternatePhone,
            cin,
            msme,
            officeAddress,
          },
        },
        gstin,
        dateOfInvoice,
        billedTo: {
          name: billedToName,
          address: billedToAddress,
        },
        shipTo: {
          name: shipToName,
          address: shipToAddress,
        },
        receiverGstin,
        items: preparedItems,
        totals: {
          subtotal,
        },
        amountInWords:
          numberToWords(Math.floor(grandTotal)) + " Rupees Only",
        bank: {
          bankName,
          accountNo,
          ifsc,
          branch,
          pincode,
        },
      };

      if (isEdit && id) {
        await api.put(`/api/bill/updatebill/${id}`, payload);
        toast.success("Bill updated successfully");
      } else {
        await api.post("/api/bill/createbill", payload);
        toast.success("Bill created successfully");
      }

      navigate("/admin/bill");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Bill save failed");
    } finally {
      setSaving(false);
    }
  };
/** ---- Service Category Dropdown ---- */
const SERVICE_CATEGORY_SAC_MAP: Record<string, string> = {
  "Graphics": "998313",
  "Website Development": "998314",
  "Photography / Video": "998386",
  "Digital Marketing": "998365",
  "Event Management": "998596",
  "Printing": "998912",
  "Studio on Rent": "997212",
};

  return (
    <div className={styles.page}>
      {/* LEFT COLUMN - form */}
      <div className={styles.left}>
        {/* header card */}
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
              onChange={(e) => {
                setSupplierGstin(e.target.value);
                setGstin(e.target.value);
              }}
            />

            <div className={styles.smallLabel}>CATEGORY</div>
            <input
              className={styles.headerInput}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
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
          </div>

          <div className={styles.headerCenter}>
            <div className={styles.logoPlaceholder}>
              Dream Byte solutions <br />
              Advertising Pvt. Ltd.
            </div>
          </div>

          <div className={styles.headerRight}>
            {/* Personal Phone */}
            <div className={styles.smallLabel}>Phone (Personal)</div>
            <input
              className={styles.headerInput}
              type="tel"
              value={`+91-${personalPhone}`}
              placeholder="+91-XXXXXXXXXX"
              onChange={(e) => {
                let value = e.target.value;
                value = value.replace("+91-", "");
                value = value.replace(/\D/g, "");
                if (value.length > 10) return;
                setPersonalPhone(value);
              }}
            />

            {/* Alternate Phone */}
            <div className={styles.smallLabel}>Phone (Alternate)</div>
            <input
              className={styles.headerInput}
              type="tel"
              value={`+91-${alternatePhone}`}
              placeholder="+91-XXXXXXXXXX"
              onChange={(e) => {
                let value = e.target.value;
                value = value.replace("+91-", "");
                value = value.replace(/\D/g, "");
                if (value.length > 10) return;
                setAlternatePhone(value);
              }}
            />

            {/* Email */}
            <div className={styles.smallLabel}>E-mail</div>
            <input
              className={styles.headerInput}
              value={officeEmail}
              onChange={(e) => setOfficeEmail(e.target.value)}
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

        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>
              {isEdit ? "Edit Invoice" : "Create Invoice"}
            </h1>
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
              {saving
                ? "Saving..."
                : isEdit
                ? "Update & Generate"
                : "Save & Generate"}
            </button>
          </div>
        </header>

        <form
          className={styles.form}
          onSubmit={(e) => e.preventDefault()}
        >
          {/* Billed To & Ship To */}
          <section className={styles.card}>
            <div className={styles.billingSection}>
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
                    onChange={(e) =>
                      setBilledToAddress(e.target.value)
                    }
                    placeholder="Billed to address"
                  />
                </label>

                <label style={{ flex: 1 }}>
                  <div className={styles.label}>Receiver's GSTIN</div>
                  <input
                    className={styles.textInput}
                    value={receiverGstin}
                    onChange={(e) =>
                      setReceiverGstin(e.target.value)
                    }
                    placeholder="Receiver GSTIN"
                  />
                </label>
              </div>

              <div className={styles.columnRight}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionTitle}>Ship To</div>
                  <label className={styles.sameAsBilling}>
                    <input
                      type="checkbox"
                      checked={sameAsBilling}
                      onChange={(e) =>
                        setSameAsBilling(e.target.checked)
                      }
                    />{" "}
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
              </div>
            </div>
          </section>

          {/* Items table */}
          <section className={styles.card}>
            <div
              className={styles.itemTableheading}
              style={{
                fontWeight: 700,
                marginBottom: 8,
                color: "#000",
              }}
            >
              Towards charges for sale of advertising space in outdoor
              media as per following details:
            </div>

            <div className={styles.itemsTable}>
              <div className={styles.itemsGridHeader}>
                <div>S.N.</div>
                <div>Services</div>
                <div>Service Type</div>
                <div>SAC/HSN</div>
                <div>Qty</div>
                <div>Note</div>
                <div>Rate (PM/SQFT)</div>
                <div>Amount</div>
                <div />
              </div>

              {items.map((it, idx) => {
                const isInvalid =
                  !it.Services.trim() ||
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

                    <input
                      className={styles.itemSmall}
                      placeholder="Services"
                      value={it.Services}
                      onChange={(e) =>
                        updateItem(it.id, {
                          Services: e.target.value,
                        })
                      }
                    />
                    <select
  className={styles.itemSmall}
  value={it.serviceCategory}
  onChange={(e) => {
    const selected = e.target.value;
    updateItem(it.id, {
      serviceCategory: selected,
      sacHsn: SERVICE_CATEGORY_SAC_MAP[selected] || "",
    });
  }}
>
  <option value="">-- Select Type --</option>
  {Object.keys(SERVICE_CATEGORY_SAC_MAP).map((type) => (
    <option key={type} value={type}>
      {type}
    </option>
  ))}
</select>

                    

                    <input
  className={styles.itemSmall}
  placeholder="SAC/HSN"
  value={it.sacHsn}
  readOnly
/>
                    <input
                      type="number"
                      min={1}
                      className={styles.itemQty}
                      placeholder="Qty"
                      value={it.qty}
                      onChange={(e) =>
                        updateItem(it.id, {
                          qty: Number(e.target.value) || 0,
                        })
                      }
                    />

                    <input
                      className={styles.itemDesc}
                      placeholder="Enter Note"
                      value={it.specification}
                      onChange={(e) =>
                        updateItem(it.id, {
                          specification: e.target.value,
                        })
                      }
                    />

                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      className={styles.itemRate}
                      placeholder="Rate"
                      value={it.rate}
                      onChange={(e) =>
                        updateItem(it.id, {
                          rate: Number(e.target.value) || 0,
                        })
                      }
                    />

                    <div className={styles.itemAmount}>
                      {formatCurrency(it.amount || 0)}
                    </div>

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

          {/* Totals */}
          <section className={styles.card}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: "#000" }}>
                  DISPLAY CHARGES
                </div>
                <div
                  style={{ marginTop: 10, color: "#555" }}
                >
                  Rupees in words:{" "}
                  <strong>
                    {numberToWords(Math.floor(grandTotal))} Only
                  </strong>
                </div>
              </div>

              <div
                style={{
                  minWidth: 260,
                  textAlign: "right",
                  color: "#000",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <div>Total Taxable Value:</div>
                  <div>{formatCurrency(subtotal)}</div>
                </div>

                <div
                  style={{
                    borderTop: "1px solid #050505ff",
                    marginTop: 8,
                    paddingTop: 8,
                    fontWeight: 700,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>Grand Total</div>
                    <div>{formatCurrency(grandTotal)}</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Bank fields */}
          <section className={styles.card}>
            <div className={styles.row}>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontWeight: 700,
                    marginBottom: 12,
                    color: "#000",
                  }}
                >
                  Our Bank Details
                </div>

                <div className={styles.bankGrid}>
                  <label>
                    <div className={styles.label}>Bank Name</div>
                    <input
                      value={bankName}
                      onChange={(e) =>
                        setBankName(e.target.value)
                      }
                      placeholder="Enter Bank Name"
                    />
                  </label>

                  <label>
                    <div className={styles.label}>A/C Number</div>
                    <input
                      value={accountNo}
                      onChange={(e) =>
                        setAccountNo(e.target.value)
                      }
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
                    <div className={styles.label}>Pincode</div>
                    <input
                      value={pincode}
                      onChange={(e) =>
                        setPincode(e.target.value)
                      }
                      placeholder="Enter Pincode"
                    />
                  </label>
                </div>
              </div>
            </div>
          </section>

          {topError && (
            <div className={styles.formError}>{topError}</div>
          )}
        </form>
      </div>

      {/* RIGHT summary */}
      <aside className={styles.right}>
        <div className={styles.summaryCard}>
          <h3>Summary</h3>

          <div className={styles.summaryRow}>
            <div>Subtotal</div>
            <div>{formatCurrency(subtotal)}</div>
          </div>

          <div className={styles.summaryTotal}>
            <div>Grand Total</div>
            <div className={styles.big}>
              {formatCurrency(grandTotal)}
            </div>
          </div>

          <div className={styles.summaryActions}>
            <button
              type="button"
              className={styles.primaryFull}
              onClick={handleSubmit}
              disabled={!!quickError || saving}
            >
              {saving
                ? "Saving..."
                : isEdit
                ? "Update & Generate"
                : "Save & Generate"}
            </button>

            <button
              type="button"
              className={styles.ghostFull}
              onClick={() => window.print()}
            >
              Print Preview
            </button>
          </div>

          {quickError && (
            <div className={styles.smallHint}>
              ⚠ {quickError}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};

export default CreateBill;
