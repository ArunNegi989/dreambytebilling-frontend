// src/pages/admin/InvoiceView.tsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/axios";
// use CreateInvoice styles so layout matches the form exactly
import styles from "../../assets/styles/admin/CreateInvoice.module.css";

/** types copied from CreateInvoice */
interface IItem {
  id: string;
  Services: string;
  sacHsn: string;
  specification: string;
  qty: number;
  rate: number;
  amount: number;
}

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

export default function InvoiceView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchInvoice = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const resp = await api.get(`/api/invoice/${id}`);
      setInvoice(resp.data);
    } catch (err: any) {
      console.error("Failed to load invoice", err);
      setError(
        err?.response?.data?.error || err?.message || "Failed to load invoice"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const items: IItem[] = Array.isArray(invoice?.items) ? invoice.items : [];

  const subtotal = useMemo(
    () => items.reduce((s, it) => s + Number(it.amount || 0), 0),
    [items]
  );
  const igst = invoice?.totals?.igst ?? 0;
  const cgst = invoice?.totals?.cgst ?? +(subtotal * 0.09).toFixed(2);
  const sgst = invoice?.totals?.sgst ?? +(subtotal * 0.09).toFixed(2);
  const grandTotal =
    invoice?.totals?.grandTotal ??
    +(subtotal + Number(igst) + Number(cgst) + Number(sgst)).toFixed(2);

  const downloadPdf = async () => {
    if (!id) return;
    try {
      const resp = await api.get(`/api/invoice/${id}/pdf`, {
        responseType: "blob",
      });
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
    <div className={styles.page}>
      {/* LEFT COLUMN - display the invoice fields in the same grouped layout as CreateInvoice */}
      <div className={styles.left}>
        <div className={styles.invoiceHeaderCard}>
          <div className={styles.headerLeft}>
            <div className={styles.smallLabel}>PAN NO.</div>
            <input
              className={styles.headerInput}
              value={invoice?.header?.panNo ?? invoice?.panNo ?? ""}
              readOnly
            />
            <div className={styles.smallLabel}>GSTIN</div>
            <input
              className={styles.headerInput}
              value={
                invoice?.header?.supplierGstin ??
                invoice?.supplierGstin ??
                invoice?.gstin ??
                ""
              }
              readOnly
            />
            <div className={styles.smallLabel}>CATEGORY</div>
            <input
              className={styles.headerInput}
              value={invoice?.header?.category ?? invoice?.category ?? ""}
              readOnly
            />
            {/* CIN */}
            <div className={styles.smallLabel}>CIN</div>
            <input
              className={styles.headerInput}
              value={invoice?.header?.office?.cin ?? invoice?.office?.cin ?? ""}
              readOnly
            />

            {/* MSME */}
            <div className={styles.smallLabel}>MSME</div>
            <input
              className={styles.headerInput}
              value={
                invoice?.header?.office?.msme ?? invoice?.office?.msme ?? ""
              }
              readOnly
            />
          </div>

          <div className={styles.headerCenter}>
            {invoice?.header?.logoUrl || invoice?.office?.logoUrl ? (
              <img
                src={invoice?.header?.logoUrl ?? invoice?.office?.logoUrl}
                alt="logo"
                style={{ maxHeight: 72 }}
              />
            ) : (
              <div className={styles.logoPlaceholder}>
                Dream Byte solutions
                <br />
                Advertising Pvt. Ltd.
              </div>
            )}
          </div>

          <div className={styles.headerRight}>
            {/* Personal Phone */}
            <div className={styles.smallLabel}>Phone (Personal)</div>
            <input
              className={styles.headerInput}
              value={
                invoice?.header?.office?.personalPhone ??
                invoice?.office?.personalPhone ??
                ""
              }
              readOnly
            />

            {/* Alternate Phone */}
            <div className={styles.smallLabel}>Phone (Alternate)</div>
            <input
              className={styles.headerInput}
              value={
                invoice?.header?.office?.alternatePhone ??
                invoice?.office?.alternatePhone ??
                ""
              }
              readOnly
            />

            {/* Email */}
            <div className={styles.smallLabel}>E-mail</div>
            <input
              className={styles.headerInput}
              value={
                invoice?.header?.office?.officeEmail ??
                invoice?.office?.officeEmail ??
                ""
              }
              readOnly
            />

            <div style={{ height: 6 }} />

            {/* Office Address */}
            <textarea
              className={styles.headerAddress}
              value={
                invoice?.header?.office?.officeAddress ??
                invoice?.office?.officeAddress ??
                invoice?.footerAddress ??
                ""
              }
              rows={3}
              readOnly
            />
          </div>
        </div>

        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Invoice View</h1>
            <p className={styles.subtitle}>Viewing invoice — read only</p>
          </div>

          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.ghost}
              onClick={() => navigate(-1)}
            >
              Back
            </button>
            <button
              type="button"
              className={styles.primary}
              onClick={downloadPdf}
              disabled={saving}
            >
              Download PDF
            </button>
          </div>
        </header>

        <form className={styles.form}>
          {/* Invoice meta */}
          <section className={styles.card}>
            <div className={styles.metaRow}>
              <label>
                <div className={styles.label}>Invoice No</div>
                <input value={invoice.invoiceNo ?? ""} readOnly />
              </label>
            </div>

            <div className={styles.metaRow}>
              <label>
                <div className={styles.label}>Place of Supply</div>
                <input value={invoice.placeOfSupply ?? ""} readOnly />
              </label>
              <label>
                <div className={styles.label}>Date of Invoice</div>
                <input
                  type="date"
                  value={invoice.dateOfInvoice?.slice(0, 10) ?? ""}
                  readOnly
                />
              </label>
            </div>
          </section>

          {/* Billed To & Ship To */}
          <section className={styles.card}>
            <div className={styles.billingSection}>
              <div className={styles.columnLeft}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionTitle}>Billed To</div>
                  <div className={styles.sectionSubtitle}>Billing details</div>
                </div>

                <label className={styles.formField}>
                  <input
                    className={styles.textInput}
                    value={invoice.billedTo?.name ?? ""}
                    readOnly
                  />
                </label>

                <label
                  className={`${styles.formField} ${styles.textareaField}`}
                >
                  <textarea
                    className={styles.textarea}
                    rows={3}
                    value={invoice.billedTo?.address ?? ""}
                    readOnly
                  />
                </label>
                <label style={{ flex: 1 }}>
                  <div className={styles.label}>Receiver's GSTIN</div>
                  <input
                    className={styles.textInput}
                    value={invoice.receiverGstin ?? ""}
                    readOnly
                  />
                </label>
              </div>

              <div className={styles.columnRight}>
                <div className={styles.sectionHeader}>
                  <div className={styles.sectionTitle}>Ship To</div>
                </div>

                <label className={styles.formField}>
                  <input
                    className={styles.textInput}
                    value={invoice.shipTo?.name ?? ""}
                    readOnly
                  />
                </label>

                <label
                  className={`${styles.formField} ${styles.textareaField}`}
                >
                  <textarea
                    className={styles.textarea}
                    rows={3}
                    value={invoice.shipTo?.address ?? ""}
                    readOnly
                  />
                </label>
              </div>
            </div>
          </section>

          {/* Items table */}
          <section className={styles.card}>
            <div
              className={styles.itemTableheading}
              style={{ fontWeight: 700, marginBottom: 8 }}
            >
              Towards charges for sale of advertising space in outdoor media as
              per following details:
            </div>

            <div className={styles.itemsTable}>
              <div className={styles.itemsGridHeader}>
                <div>S.N.</div>
                <div>Services</div>
                <div>SAC/HSN</div>
                <div>Qty</div>
                <div>Note</div>
                <div>Rate (PM/SQFT)</div>
                <div>Amount</div>
                <div />
              </div>

              {items.length === 0 ? (
                <div style={{ padding: 12 }}>No items</div>
              ) : (
                items.map((it, idx) => (
                  <div key={it.id} className={styles.itemRow}>
                    <div className={styles.itemIndex}>{idx + 1}</div>
                    <input
                      className={styles.itemSmall}
                      value={it.Services ?? ""}
                      readOnly
                    />
                    <input
                      className={styles.itemSmall}
                      value={it.sacHsn ?? ""}
                      readOnly
                    />
                    <input
                      type="number"
                      min={1}
                      className={styles.itemQty}
                      value={it.qty ?? 0}
                      readOnly
                    />
                    <input
                      className={styles.itemDesc}
                      value={it.specification ?? ""}
                      readOnly
                    />
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      className={styles.itemRate}
                      value={it.rate ?? 0}
                      readOnly
                    />
                    <div className={styles.itemAmount}>
                      {formatCurrency(Number(it.amount ?? 0))}
                    </div>
                    <div className={styles.itemActionsCell}></div>
                  </div>
                ))
              )}
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
                  <div>IGST:</div>
                  <div>{formatCurrency(Number(igst || 0))}</div>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <div>CGST:</div>
                  <div>{formatCurrency(Number(cgst || 0))}</div>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <div>SGST:</div>
                  <div>{formatCurrency(Number(sgst || 0))}</div>
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
                    style={{ display: "flex", justifyContent: "space-between" }}
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
                  style={{ fontWeight: 700, marginBottom: 12, color: "#000" }}
                >
                  Our Bank Details
                </div>
                <div className={styles.bankGrid}>
                  <div>
                    <div className={styles.label}>Bank Name</div>
                    <input value={invoice?.bank?.bankName ?? ""} readOnly />
                  </div>
                  <div>
                    <div className={styles.label}>A/C Number</div>
                    <input value={invoice?.bank?.accountNo ?? ""} readOnly />
                  </div>
                  <div>
                    <div className={styles.label}>IFSC Code</div>
                    <input value={invoice?.bank?.ifsc ?? ""} readOnly />
                  </div>
                  <div>
                    <div className={styles.label}>Branch</div>
                    <input value={invoice?.bank?.branch ?? ""} readOnly />
                  </div>
                  <div>
                    <div className={styles.label}>Pincode</div>
                    <input value={invoice?.bank?.pincode ?? ""} readOnly />
                  </div>
                </div>
              </div>
            </div>
          </section>
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
          <div className={styles.summaryRow}>
            <div>IGST</div>
            <div>{formatCurrency(Number(igst || 0))}</div>
          </div>
          <div className={styles.summaryRow}>
            <div>CGST</div>
            <div>{formatCurrency(Number(cgst || 0))}</div>
          </div>
          <div className={styles.summaryRow}>
            <div>SGST</div>
            <div>{formatCurrency(Number(sgst || 0))}</div>
          </div>

          <div className={styles.summaryTotal}>
            <div>Grand Total</div>
            <div className={styles.big}>{formatCurrency(grandTotal)}</div>
          </div>

          <div className={styles.summaryActions}>
            <button
              type="button"
              className={styles.primaryFull}
              onClick={downloadPdf}
            >
              Download PDF
            </button>
            <button
              type="button"
              className={styles.ghostFull}
              onClick={() => window.print()}
            >
              Print Preview
            </button>
          </div>

          <div style={{ marginTop: 8, color: "#444" }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>
              Amount (in words)
            </div>
            <div style={{ marginTop: 6 }}>
              {numberToWords(Math.floor(grandTotal))} Rupees Only
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
