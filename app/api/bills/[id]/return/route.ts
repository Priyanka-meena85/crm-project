import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { demoStore } from "@/lib/demo-store";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    try {
      const bill = await prisma.bill.findUnique({
        where: { id: params.id },
        include: { items: true },
      });
      if (!bill) {
        return NextResponse.json({ error: "Bill nahi mila." }, { status: 404 });
      }
      if (bill.status === "Returned") {
        return NextResponse.json(
          { error: "Ye bill pehle hi Return ho chuka hai." },
          { status: 400 }
        );
      }

      const updated = await prisma.$transaction(async (tx) => {
        const ret = await tx.bill.update({
          where: { id: params.id },
          data: { status: "Returned" },
        });
        for (const item of bill.items) {
          await tx.stock.updateMany({
            where: { product_id: item.product_id, size: item.size },
            data: { quantity: { increment: item.qty } },
          });
        }
        await tx.customer.update({
          where: { id: bill.customer_id },
          data: { total_kharida: { decrement: bill.final_total } },
        });
        return ret;
      });
      return NextResponse.json({ bill: updated, message: "Return Bill ban gaya!" });
    } catch {
      const bill = demoStore.bills.find((b) => b.id === params.id);
      if (!bill) {
        return NextResponse.json({ error: "Bill nahi mila." }, { status: 404 });
      }
      if (bill.status === "Returned") {
        return NextResponse.json(
          { error: "Ye bill pehle hi Return ho chuka hai." },
          { status: 400 }
        );
      }
      bill.status = "Returned";
      for (const item of bill.items) {
        const prod = demoStore.products.find((p) => p.id === item.product_id);
        const st = prod?.stocks.find((s) => s.size === item.size);
        if (st) st.quantity += item.qty;
      }
      const cust = demoStore.customers.find((c) => c.id === bill.customer_id);
      if (cust) {
        cust.total_kharida = Math.max(0, cust.total_kharida - bill.final_total);
      }
      return NextResponse.json({ bill, message: "Return Bill ban gaya! Stock wapas add ho gaya." });
    }
  } catch {
    return NextResponse.json(
      { error: "Return process nahi ho paya." },
      { status: 500 }
    );
  }
}
