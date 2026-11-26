import { NextResponse } from "next/server";
import { PaymentMethod, UdhaarStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { demoStore } from "@/lib/demo-store";

interface BillItemInput {
  product_id: string;
  size: string;
  qty: number;
  price: number;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get("customerId");

  try {
    const bills = await prisma.bill.findMany({
      where: customerId ? { customer_id: customerId } : undefined,
      include: {
        customer: true,
        staff: true,
        items: { include: { product: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ bills });
  } catch {
    const bills = customerId
      ? demoStore.bills.filter((b) => b.customer_id === customerId)
      : demoStore.bills;
    return NextResponse.json({ bills });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customer_id,
      staff_id,
      items,
      discount = 0,
      payment_method = "UPI",
    }: {
      customer_id: string;
      staff_id?: string;
      items: BillItemInput[];
      discount?: number;
      payment_method?: PaymentMethod;
    } = body;

    if (!customer_id || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Customer aur kam se kam 1 item select karein." },
        { status: 400 }
      );
    }

    try {
      const result = await prisma.$transaction(async (tx) => {
        let resolvedStaffId = staff_id;
        if (!resolvedStaffId) {
          const firstStaff = await tx.staff.findFirst({
            orderBy: { createdAt: "asc" },
          });
          if (!firstStaff) throw new Error("No staff found");
          resolvedStaffId = firstStaff.id;
        }

        const lastBill = await tx.bill.findFirst({
          orderBy: { bill_no: "desc" },
        });
        const nextBillNo = Math.max(1025, (lastBill?.bill_no ?? 1024) + 1);

        const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
        const final_total = Math.max(0, total - Number(discount || 0));

        const bill = await tx.bill.create({
          data: {
            bill_no: nextBillNo,
            customer_id,
            staff_id: resolvedStaffId,
            total,
            discount: Number(discount || 0),
            final_total,
            payment_method: payment_method as PaymentMethod,
            status: payment_method === "Udhaar" ? "Udhaar" : "Paid",
            items: {
              create: items.map((item) => ({
                product_id: item.product_id,
                size: item.size,
                qty: item.qty,
                price: item.price,
              })),
            },
          },
          include: {
            customer: true,
            staff: true,
            items: { include: { product: true } },
          },
        });

        for (const item of items) {
          const stockRecord = await tx.stock.findUnique({
            where: {
              product_id_size: { product_id: item.product_id, size: item.size },
            },
          });
          if (stockRecord) {
            await tx.stock.update({
              where: { id: stockRecord.id },
              data: { quantity: Math.max(0, stockRecord.quantity - item.qty) },
            });
          }
        }

        const updatedTotal = bill.customer.total_kharida + final_total;
        await tx.customer.update({
          where: { id: customer_id },
          data: {
            total_kharida: updatedTotal,
            last_visit: new Date(),
            is_vip: bill.customer.is_vip || updatedTotal > 50000,
            is_inactive: false,
          },
        });

        await tx.staff.update({
          where: { id: resolvedStaffId },
          data: { current_sale: { increment: final_total } },
        });

        if (payment_method === "Udhaar") {
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 15);
          await tx.udhaar.create({
            data: {
              customer_id,
              amount: final_total,
              due_date: dueDate,
              status: UdhaarStatus.Pending,
            },
          });
        }

        return bill;
      });

      const waMessage = `Namaste ${result.customer.name} ji! Priya Boutique Nathdwara se aapka Bill #${result.bill_no} ban gaya hai. Total: Rs. ${result.final_total.toLocaleString("en-IN")} (${result.payment_method}). Dhanyavaad!`;
      return NextResponse.json(
        { bill: result, waLink: buildWhatsAppLink(result.customer.phone, waMessage) },
        { status: 201 }
      );
    } catch {
      // Demo fallback mode
      const customer =
        demoStore.customers.find((c) => c.id === customer_id) ||
        demoStore.customers[0];
      const staff =
        demoStore.staff.find((s) => s.id === staff_id) || demoStore.staff[1];

      const billNo = demoStore.nextBillNo++;
      const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
      const final_total = Math.max(0, total - Number(discount || 0));

      const billItems = items.map((i, idx) => {
        const product =
          demoStore.products.find((p) => p.id === i.product_id) ||
          demoStore.products[0];
        const st = product.stocks.find((s) => s.size === i.size);
        if (st) st.quantity = Math.max(0, st.quantity - i.qty);
        return {
          id: `bi-${Date.now()}-${idx}`,
          product_id: product.id,
          size: i.size,
          qty: i.qty,
          price: i.price,
          product,
        };
      });

      customer.total_kharida += final_total;
      customer.last_visit = new Date().toISOString();
      customer.is_vip = customer.is_vip || customer.total_kharida > 50000;
      customer.is_inactive = false;

      staff.current_sale += final_total;

      if (payment_method === "Udhaar") {
        demoStore.udhaars.unshift({
          id: `udh-${Date.now()}`,
          customer_id: customer.id,
          amount: final_total,
          due_date: new Date(Date.now() + 15 * 86400000).toISOString(),
          status: "Pending",
          customer: { name: customer.name, phone: customer.phone },
        });
      }

      const bill = {
        id: `bill-${billNo}`,
        bill_no: billNo,
        customer_id: customer.id,
        staff_id: staff.id,
        total,
        discount: Number(discount || 0),
        final_total,
        payment_method: String(payment_method),
        status: payment_method === "Udhaar" ? "Udhaar" : "Paid",
        createdAt: new Date().toISOString(),
        customer,
        staff,
        items: billItems,
      };
      demoStore.bills.unshift(bill);

      const waMessage = `Namaste ${customer.name} ji! Priya Boutique Nathdwara se aapka Bill #${bill.bill_no} ban gaya hai. Total: Rs. ${bill.final_total.toLocaleString("en-IN")} (${bill.payment_method}). Dhanyavaad!`;
      return NextResponse.json(
        { bill, waLink: buildWhatsAppLink(customer.phone, waMessage) },
        { status: 201 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Bill generate nahi ho paya." },
      { status: 500 }
    );
  }
}
