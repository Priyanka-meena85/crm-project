import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateBillPdf } from "@/lib/pdf";
import { demoStore } from "@/lib/demo-store";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    let billData: {
      bill_no: number;
      createdAt: Date | string;
      customerName: string;
      customerPhone: string;
      staffName: string;
      paymentMethod: string;
      total: number;
      discount: number;
      finalTotal: number;
      items: { name: string; size: string; qty: number; price: number }[];
    } | null = null;

    try {
      const bill = await prisma.bill.findUnique({
        where: { id: params.id },
        include: {
          customer: true,
          staff: true,
          items: { include: { product: true } },
        },
      });
      if (bill) {
        billData = {
          bill_no: bill.bill_no,
          createdAt: bill.createdAt,
          customerName: bill.customer.name,
          customerPhone: bill.customer.phone,
          staffName: bill.staff.name,
          paymentMethod: bill.payment_method,
          total: bill.total,
          discount: bill.discount,
          finalTotal: bill.final_total,
          items: bill.items.map((item) => ({
            name: item.product.name,
            size: item.size,
            qty: item.qty,
            price: item.price,
          })),
        };
      }
    } catch {
      const demoBill = demoStore.bills.find((b) => b.id === params.id);
      if (demoBill) {
        billData = {
          bill_no: demoBill.bill_no,
          createdAt: demoBill.createdAt,
          customerName: demoBill.customer.name,
          customerPhone: demoBill.customer.phone,
          staffName: demoBill.staff.name,
          paymentMethod: demoBill.payment_method,
          total: demoBill.total,
          discount: demoBill.discount,
          finalTotal: demoBill.final_total,
          items: demoBill.items.map((item) => ({
            name: item.product.name,
            size: item.size,
            qty: item.qty,
            price: item.price,
          })),
        };
      }
    }

    if (!billData) {
      return NextResponse.json({ error: "Bill nahi mila." }, { status: 404 });
    }

    const pdfBytes = await generateBillPdf({
      billNo: billData.bill_no,
      date: new Date(billData.createdAt).toLocaleDateString("en-IN"),
      customerName: billData.customerName,
      customerPhone: billData.customerPhone,
      staffName: billData.staffName,
      paymentMethod: billData.paymentMethod,
      total: billData.total,
      discount: billData.discount,
      finalTotal: billData.finalTotal,
      items: billData.items,
    });

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Priya-Boutique-Bill-${billData.bill_no}.pdf"`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "PDF generate nahi ho paya." },
      { status: 500 }
    );
  }
}
