import React, { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const InvoicePreviewToPdf: React.FC = () => {
  const invoiceRef = useRef<HTMLDivElement | null>(null);

  const downloadPdf = async () => {
    if (!invoiceRef.current) return;
    const canvas = await html2canvas(invoiceRef.current, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/jpeg", 1.0);
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = 210;
    const imgProps: any = (pdf as any).getImageProperties(imgData);
    const pdfImageHeight = (imgProps.height * pageWidth) / imgProps.width;
    pdf.addImage(imgData, "JPEG", 0, 0, pageWidth, pdfImageHeight);
    pdf.save(`invoice-${Date.now()}.pdf`);
  };

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <button onClick={downloadPdf}>Download PDF (client)</button>
      </div>

      <div ref={invoiceRef} style={{ background: "#fff", padding: 16 }}>
        <h2>Invoice Preview</h2>
        <p>This is a preview. Use server PDF for production-quality results.</p>
        {/* Build a small sample invoice DOM */}
        <div>
          <strong>From:</strong> Your Company<br />
          <strong>To:</strong> Client Name<br />
        </div>
      </div>
    </div>
  );
};

export default InvoicePreviewToPdf;
