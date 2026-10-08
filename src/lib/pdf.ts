import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { QuoteRequest } from "./types";
import fs from "fs";
import path from "path";

export function generateProformaPDF(request: QuoteRequest): Buffer {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // ========== بارگذاری فونت فارسی ==========
  try {
    const fontPath = path.join(process.cwd(), "public", "Vazirmatn-Regular.ttf");
    if (fs.existsSync(fontPath)) {
      const fontData = fs.readFileSync(fontPath);
      const fontBase64 = fontData.toString("base64");
      doc.addFileToVFS("Vazirmatn-Regular.ttf", fontBase64);
      doc.addFont("Vazirmatn-Regular.ttf", "Vazirmatn", "normal");
      doc.setFont("Vazirmatn");
    }
  } catch (e) {
    console.error("Font load error:", e);
  }

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 12;

  // ========== لوگو ==========
  try {
    const logoPath = path.join(process.cwd(), "public", "logo.png");
    if (fs.existsSync(logoPath)) {
      const logoData = fs.readFileSync(logoPath);
      const logoBase64 = `data:image/png;base64,${logoData.toString("base64")}`;
      doc.addImage(logoBase64, "PNG", pageWidth / 2 - 28, y, 56, 24);
      y += 30;
    }
  } catch (e) {
    console.error("Logo error:", e);
    y += 5;
  }

  // ========== عنوان ==========
  doc.setFont("Vazirmatn");
  doc.setFontSize(18);
  doc.setTextColor(0, 51, 102);
  doc.text("پیش فاکتور", pageWidth / 2, y, { align: "center" });
  y += 8;

  doc.setFontSize(11);
  doc.setTextColor(50, 50, 50);
  doc.text("شرکت کربن استیل شهباز", pageWidth / 2, y, { align: "center" });
  y += 5;
  doc.setFontSize(9);
  doc.text("ارائه دهنده لوله و اتصالات ساختمانی و صنعتی (نفت، گاز، پتروشیمی و بخار)", pageWidth / 2, y, {
    align: "center",
  });
  y += 9;

  // خط
  doc.setDrawColor(0, 80, 150);
  doc.setLineWidth(0.7);
  doc.line(15, y, pageWidth - 15, y);
  y += 9;

  // ========== اطلاعات پیش فاکتور ==========
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text("اطلاعات پیش فاکتور", pageWidth - 15, y, { align: "right" });
  y += 6;

  doc.setFontSize(9);

  const proformaDate = new Date(request.quotedAt || request.createdAt).toLocaleDateString("fa-IR");
  doc.text(`شماره: ${request.trackingCode}`, pageWidth - 15, y, { align: "right" });
  doc.text(`تاریخ: ${proformaDate}`, 15, y);
  y += 5;

  if (request.validityDays && request.validUntil) {
    const validDate = new Date(request.validUntil).toLocaleDateString("fa-IR");
    doc.text(`مدت اعتبار: ${request.validityDays} روز`, pageWidth - 15, y, { align: "right" });
    doc.text(`اعتبار تا: ${validDate}`, 15, y);
    y += 5;
  }

  y += 5;

  // ========== اطلاعات مشتری ==========
  doc.setFontSize(10);
  doc.text("اطلاعات مشتری", pageWidth - 15, y, { align: "right" });
  y += 6;

  doc.setFontSize(9);
  doc.text(`نام: ${request.customerName}`, pageWidth - 15, y, { align: "right" });
  y += 4.5;
  if (request.companyName) {
    doc.text(`شرکت: ${request.companyName}`, pageWidth - 15, y, { align: "right" });
    y += 4.5;
  }
  doc.text(`تلفن: ${request.phone}`, pageWidth - 15, y, { align: "right" });
  y += 4.5;
  if (request.email) {
    doc.text(`ایمیل: ${request.email}`, pageWidth - 15, y, { align: "right" });
    y += 4.5;
  }
  if (request.address) {
    doc.text(`آدرس: ${request.address}`, pageWidth - 15, y, { align: "right" });
    y += 4.5;
  }

  y += 7;

  // ========== جدول راست‌چین ==========
  const tableData = request.items.map((item, index) => [
    (index + 1).toString(),
    item.description,
    item.quantity.toString(),
    item.unit,
    item.unitPrice ? item.unitPrice.toLocaleString("fa-IR") : "-",
    item.totalPrice ? item.totalPrice.toLocaleString("fa-IR") : "-",
  ]);

  autoTable(doc, {
    startY: y,
    head: [["ردیف", "شرح کالا", "تعداد", "واحد", "قیمت واحد (ریال)", "جمع (ریال)"]],
    body: tableData,
    styles: {
      font: "Vazirmatn",
      fontSize: 8,
      cellPadding: 2.5,
      halign: "center",
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [0, 80, 150],
      textColor: 255,
      fontStyle: "normal",
      fontSize: 8,
      halign: "center",
      font: "Vazirmatn",
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 14 },
      1: { halign: "right", cellWidth: 55 },
      2: { halign: "center", cellWidth: 18 },
      3: {halign: "center", cellWidth: 18 },
      4: {halign: "left", cellWidth: 32 },
      5: {halign: "left", cellWidth: 32 },
    },
    margin: { left: 15, right: 15 },
  });

  // @ts-ignore
  y = doc.lastAutoTable.finalY + 9;

  // ========== جمع کل ==========
  if (request.totalAmount) {
    doc.setFont("Vazirmatn");
    doc.setFontSize(12);
    doc.setTextColor(0, 51, 102);
    doc.text(
      `جمع کل: ${request.totalAmount.toLocaleString("fa-IR")} ریال`,
      pageWidth - 15,
      y,
      { align: "right" }
    );
    y += 8;
  }

  // ========== زمان و محل تحویل ==========
  if (request.deliveryTime || request.deliveryLocation) {
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    if (request.deliveryTime) {
      doc.text(`مدت زمان تحویل: ${request.deliveryTime}`, pageWidth - 15, y, { align: "right" });
      y += 5;
    }
    if (request.deliveryLocation) {
      doc.text(`محل تحویل: ${request.deliveryLocation}`, pageWidth - 15, y, { align: "right" });
      y += 5;
    }
    y += 3;
  }

  // ========== شرایط ==========
  if (request.adminNotes) {
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text("شرایط و توضیحات:", pageWidth - 15, y, { align: "right" });
    y += 5;
    doc.setFontSize(8);
    const splitNotes = doc.splitTextToSize(request.adminNotes, pageWidth - 30);
    doc.text(splitNotes, pageWidth - 15, y, { align: "right" });
    y += splitNotes.length * 4 + 6;
  }

  // ========== اطلاعات حساب بانکی ==========
  y += 4;
  doc.setDrawColor(0, 80, 150);
  doc.setLineWidth(0.4);
  doc.line(15, y, pageWidth - 15, y);
  y += 6;

  doc.setFontSize(9);
  doc.setTextColor(0, 51, 102);
  doc.text("اطلاعات حساب بانکی جهت واریز:", pageWidth - 15, y, { align: "right" });
  y += 5;

  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text("بانک صادرات - شرکت کربن استیل شهباز", pageWidth - 15, y, { align: "right" });
  y += 4.5;
  doc.text("شماره شبا: IR 400190000000111995897005", pageWidth - 15, y, { align: "right" });
  y += 8;

  // ========== فوتر ==========
  const footerY = 275;
  doc.setDrawColor(150);
  doc.setLineWidth(0.3);
  doc.line(15, footerY, pageWidth - 15, footerY);

  doc.setFontSize(7.5);
  doc.setTextColor(100);
  doc.text(
    "این سند پیش فاکتور است و فاکتور رسمی مالیاتی محسوب نمی شود.",
    pageWidth / 2,
    footerY + 5,
    { align: "center" }
  );
  doc.text(
    "قیمت ها فقط تا تاریخ اعتبار ذکر شده معتبر می باشند. شرکت کربن استیل شهباز",
    pageWidth / 2,
    footerY + 9,
    { align: "center" }
  );

  return Buffer.from(doc.output("arraybuffer"));
}
