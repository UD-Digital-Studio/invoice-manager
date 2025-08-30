'use client';

import { Invoice, Totals } from "@/type";
import confetti from "canvas-confetti";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { ArrowDownFromLine, Layers } from "lucide-react";
import React, { useRef } from "react";

interface FacturePDFProps {
  invoice: Invoice;
  totals: Totals;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "short", year: "numeric" };
  return date.toLocaleDateString("fr-FR", options);
}

// A4 width (~96dpi)
const A4_WIDTH_PX = 794;

const InvoicePDF: React.FC<FacturePDFProps> = ({ invoice, totals }) => {
  // Off-screen capture target (always mounted)
  const factureRef = useRef<HTMLDivElement>(null);

  const InvoiceContent: React.FC = () => (
    <>
      <div className="flex justify-between items-center text-sm">
        <div className="flex flex-col">
          <div className="flex items-center">
            <div className="bg-accent-content text-accent rounded-full p-2">
              <Layers className="h-6 w-6" />
            </div>
            <span className="ml-3 font-bold text-2xl italic">
              In<span className="text-accent">Voice</span>
            </span>
          </div>
          <h1 className="text-7xl font-bold uppercase">Facture</h1>
        </div>
        <div className="text-right uppercase">
          <p className="badge badge-ghost">Facture ° {invoice.id}</p>
          <p className="my-2">
            <strong>Date </strong>{formatDate(invoice.invoiceDate)}
          </p>
          <p>
            <strong>Date d&apos;échéance </strong>{formatDate(invoice.dueDate)}
          </p>
        </div>
      </div>

      <div className="my-6 flex justify-between">
        <div>
          <p className="badge badge-ghost mb-2">Émetteur</p>
          <p className="text-sm font-bold italic">{invoice.issuerName}</p>
          <p className="text-sm text-gray-500 w-52 break-words">{invoice.issuerAddress}</p>
        </div>
        <div className="text-right">
          <p className="badge badge-ghost mb-2">Client</p>
          <p className="text-sm font-bold italic">{invoice.clientName}</p>
          <p className="text-sm text-gray-500 w-52 break-words">{invoice.clientAddress}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table table-zebra">
          <thead>
            <tr>
              <th></th>
              <th>Description</th>
              <th>Quantité</th>
              <th>Prix Unitaire</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lines.map((ligne, index) => (
              <tr key={index + 1}>
                <td>{index + 1}</td>
                <td>{ligne.description}</td>
                <td>{ligne.quantity}</td>
                <td>{ligne.unitPrice.toFixed(2)} €</td>
                <td>{(ligne.quantity * ligne.unitPrice).toFixed(2)} €</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 space-y-2 text-md">
        <div className="flex justify-between">
          <div className="font-bold">Total Hors Taxes</div>
          <div>{totals.totalHT.toFixed(2)} €</div>
        </div>

        {invoice.vatActive && (
          <div className="flex justify-between">
            <div className="font-bold">TVA {invoice.vatRate} %</div>
            <div>{totals.totalVAT.toFixed(2)} €</div>
          </div>
        )}

        <div className="flex justify-between">
          <div className="font-bold">Total Toutes Taxes Comprises</div>
          <div className="badge badge-accent">{totals.totalTTC.toFixed(2)} €</div>
        </div>
      </div>
    </>
  );

  const handleDownloadPdf = async () => {
    const element = factureRef.current;
    if (!element) return;
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "A4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgW = pdfWidth;
      const imgH = (canvas.height * imgW) / canvas.width;

      let heightLeft = imgH;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgW, imgH);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        pdf.addPage();
        position = -(imgH - heightLeft);
        pdf.addImage(imgData, "PNG", 0, position, imgW, imgH);
        heightLeft -= pdfHeight;
      }

      pdf.save(`facture-${invoice.name}.pdf`);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, zIndex: 9999 });
    } catch (error) {
      console.error("Erreur lors de la génération du PDF :", error);
    }
  };

  return (
    <>
      {/* SM/MD: button only */}
      <div className="mt-4 block lg:hidden text-end">
        <button onClick={handleDownloadPdf} className="btn btn-sm btn-accent mb-4">
          Facture PDF <ArrowDownFromLine className="w-4" />
        </button>
      </div>

      {/* LG: preview + button with crisp dashed overlay */}
      <div className="mt-4 hidden lg:block">
        <div className="relative rounded-xl p-5 w-fit mx-auto">
          {/* dashed frame overlay so corners don’t break */}
          <div className="pointer-events-none absolute inset-0 rounded-xl border-2 border-dashed border-base-300" />
          <button onClick={handleDownloadPdf} className="relative z-10 btn btn-sm btn-accent mb-4">
            Facture PDF <ArrowDownFromLine className="w-4" />
          </button>
          {/* the visible preview */}
          <div className="relative z-10 rounded-lg bg-white p-8">
            <InvoiceContent />
          </div>
        </div>
      </div>

      {/* Off-screen A4 capture target (always mounted, NOT display:none) */}
      <div aria-hidden className="pointer-events-none fixed -left-[9999px] top-0">
        <div className="bg-white p-8" style={{ width: A4_WIDTH_PX }} ref={factureRef}>
          <InvoiceContent />
        </div>
      </div>
    </>
  );
};

export default InvoicePDF;
