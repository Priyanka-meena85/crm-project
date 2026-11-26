import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export interface BillPdfInput {
  billNo: number;
  date: string;
  customerName: string;
  customerPhone: string;
  staffName: string;
  paymentMethod: string;
  total: number;
  discount: number;
  finalTotal: number;
  items: {
    name: string;
    size: string;
    qty: number;
    price: number;
  }[];
}

export async function generateBillPdf(input: BillPdfInput): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([420, 620]);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const maroon = rgb(0.533, 0.075, 0.216);
  const gold = rgb(0.792, 0.541, 0.016);
  const charcoal = rgb(0.11, 0.098, 0.09);
  const ivory = rgb(1, 0.984, 0.922);

  // Warm Ivory Background
  page.drawRectangle({
    x: 0,
    y: 0,
    width: 420,
    height: 620,
    color: ivory,
  });

  // Top Maroon Header
  page.drawRectangle({
    x: 0,
    y: 530,
    width: 420,
    height: 90,
    color: maroon,
  });

  page.drawText("PRIYA BOUTIQUE", {
    x: 28,
    y: 580,
    size: 20,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText("Nathdwara • Customer Kabhi Nahi Bhoolega", {
    x: 28,
    y: 558,
    size: 10,
    font: fontRegular,
    color: rgb(0.99, 0.89, 0.65),
  });

  // Gold Accent Bar
  page.drawRectangle({
    x: 0,
    y: 525,
    width: 420,
    height: 5,
    color: gold,
  });

  // Bill Metadata
  page.drawText(`Bill No: #${input.billNo}`, {
    x: 28,
    y: 495,
    size: 13,
    font: fontBold,
    color: maroon,
  });

  page.drawText(`Date: ${input.date}`, {
    x: 260,
    y: 495,
    size: 10,
    font: fontRegular,
    color: charcoal,
  });

  page.drawText(`Customer: ${input.customerName}`, {
    x: 28,
    y: 472,
    size: 11,
    font: fontBold,
    color: charcoal,
  });

  page.drawText(`Phone: ${input.customerPhone}`, {
    x: 28,
    y: 455,
    size: 10,
    font: fontRegular,
    color: charcoal,
  });

  page.drawText(`Staff: ${input.staffName} | Payment: ${input.paymentMethod}`, {
    x: 28,
    y: 438,
    size: 10,
    font: fontRegular,
    color: charcoal,
  });

  // Divider
  page.drawLine({
    start: { x: 28, y: 422 },
    end: { x: 392, y: 422 },
    thickness: 1.5,
    color: gold,
  });

  // Table Headers
  page.drawText("Item", { x: 28, y: 402, size: 10, font: fontBold, color: maroon });
  page.drawText("Size", { x: 205, y: 402, size: 10, font: fontBold, color: maroon });
  page.drawText("Qty", { x: 255, y: 402, size: 10, font: fontBold, color: maroon });
  page.drawText("Amount", { x: 320, y: 402, size: 10, font: fontBold, color: maroon });

  let y = 378;
  for (const item of input.items) {
    const lineTotal = item.price * item.qty;
    page.drawText(item.name.slice(0, 28), {
      x: 28,
      y,
      size: 10,
      font: fontRegular,
      color: charcoal,
    });
    page.drawText(item.size, {
      x: 205,
      y,
      size: 10,
      font: fontRegular,
      color: charcoal,
    });
    page.drawText(String(item.qty), {
      x: 258,
      y,
      size: 10,
      font: fontRegular,
      color: charcoal,
    });
    page.drawText(`Rs. ${lineTotal.toLocaleString("en-IN")}`, {
      x: 320,
      y,
      size: 10,
      font: fontBold,
      color: charcoal,
    });
    y -= 24;
  }

  // Totals Divider
  page.drawLine({
    start: { x: 28, y: y - 4 },
    end: { x: 392, y: y - 4 },
    thickness: 1,
    color: gold,
  });

  y -= 28;
  page.drawText(`Subtotal: Rs. ${input.total.toLocaleString("en-IN")}`, {
    x: 240,
    y,
    size: 10,
    font: fontRegular,
    color: charcoal,
  });

  y -= 18;
  page.drawText(`Discount: - Rs. ${input.discount.toLocaleString("en-IN")}`, {
    x: 240,
    y,
    size: 10,
    font: fontRegular,
    color: charcoal,
  });

  y -= 26;
  page.drawText(`Final Total: Rs. ${input.finalTotal.toLocaleString("en-IN")}`, {
    x: 220,
    y,
    size: 14,
    font: fontBold,
    color: maroon,
  });

  // Footer
  page.drawText("Dhanyavaad! Dobara Zaroor Padharein - Priya Boutique Nathdwara", {
    x: 44,
    y: 42,
    size: 9.5,
    font: fontBold,
    color: maroon,
  });

  return pdfDoc.save();
}
