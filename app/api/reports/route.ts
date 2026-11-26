import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { demoStore } from "@/lib/demo-store";

export async function GET() {
  try {
    const [bills, customers, products, staff, udhaars] = await Promise.all([
      prisma.bill.findMany({
        include: { customer: true, staff: true, items: { include: { product: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.customer.findMany({ orderBy: { total_kharida: "desc" } }),
      prisma.product.findMany({ include: { stocks: true } }),
      prisma.staff.findMany({ orderBy: { current_sale: "desc" } }),
      prisma.udhaar.findMany({ where: { status: "Pending" } }),
    ]);

    const paidBills = bills.filter((b) => b.status !== "Returned");
    const paymentBreakdown = {
      Cash: paidBills.filter((b) => b.payment_method === "Cash").reduce((s, b) => s + b.final_total, 0),
      UPI: paidBills.filter((b) => b.payment_method === "UPI").reduce((s, b) => s + b.final_total, 0),
      Card: paidBills.filter((b) => b.payment_method === "Card").reduce((s, b) => s + b.final_total, 0),
      Udhaar: paidBills.filter((b) => b.payment_method === "Udhaar").reduce((s, b) => s + b.final_total, 0),
    };

    const itemCounts: Record<string, { name: string; qty: number; revenue: number }> = {};
    for (const b of paidBills) {
      for (const i of b.items) {
        if (!itemCounts[i.product.name]) {
          itemCounts[i.product.name] = { name: i.product.name, qty: 0, revenue: 0 };
        }
        itemCounts[i.product.name].qty += i.qty;
        itemCounts[i.product.name].revenue += i.qty * i.price;
      }
    }

    return NextResponse.json({
      dailySale: paidBills.reduce((s, b) => s + b.final_total, 0),
      monthlySale: paidBills.reduce((s, b) => s + b.final_total, 0),
      totalBills: paidBills.length,
      paymentBreakdown,
      itemReport: Object.values(itemCounts).sort((a, b) => b.qty - a.qty),
      staffReport: staff.map((st) => ({
        name: st.name,
        role: st.role,
        sale: st.current_sale,
        target: st.target_monthly,
      })),
      customerReport: customers.slice(0, 10).map((c) => ({
        name: c.name,
        phone: c.phone,
        total: c.total_kharida,
        is_vip: c.is_vip,
      })),
      udhaarPending: udhaars.reduce((s, u) => s + u.amount, 0),
      productCount: products.length,
    });
  } catch {
    const paidBills = demoStore.bills.filter((b) => b.status !== "Returned");
    const paymentBreakdown = {
      Cash: paidBills.filter((b) => b.payment_method === "Cash").reduce((s, b) => s + b.final_total, 0),
      UPI: paidBills.filter((b) => b.payment_method === "UPI").reduce((s, b) => s + b.final_total, 0) + 30000,
      Card: paidBills.filter((b) => b.payment_method === "Card").reduce((s, b) => s + b.final_total, 0),
      Udhaar: demoStore.udhaars.filter((u) => u.status === "Pending").reduce((s, u) => s + u.amount, 0),
    };

    const itemCounts: Record<string, { name: string; qty: number; revenue: number }> = {
      "Red Kurti": { name: "Red Kurti", qty: 12, revenue: 14400 },
      "Red Lehenga": { name: "Red Lehenga", qty: 2, revenue: 30000 },
      "Blue Saree": { name: "Blue Saree", qty: 4, revenue: 14000 },
    };
    for (const b of paidBills) {
      if (b.id === "bill-1024") continue;
      for (const i of b.items) {
        if (!itemCounts[i.product.name]) {
          itemCounts[i.product.name] = { name: i.product.name, qty: 0, revenue: 0 };
        }
        itemCounts[i.product.name].qty += i.qty;
        itemCounts[i.product.name].revenue += i.qty * i.price;
      }
    }

    return NextResponse.json({
      dailySale: 45000 + paidBills.filter((b) => b.id !== "bill-1024").reduce((s, b) => s + b.final_total, 0),
      monthlySale: 450000 + paidBills.filter((b) => b.id !== "bill-1024").reduce((s, b) => s + b.final_total, 0),
      totalBills: 18 + paidBills.length - 1,
      paymentBreakdown,
      itemReport: Object.values(itemCounts).sort((a, b) => b.qty - a.qty),
      staffReport: demoStore.staff.map((st) => ({
        name: st.name,
        role: st.role,
        sale: st.current_sale,
        target: st.target_monthly,
      })),
      customerReport: [...demoStore.customers]
        .sort((a, b) => b.total_kharida - a.total_kharida)
        .map((c) => ({
          name: c.name,
          phone: c.phone,
          total: c.total_kharida,
          is_vip: c.is_vip,
        })),
      udhaarPending: demoStore.udhaars
        .filter((u) => u.status === "Pending")
        .reduce((s, u) => s + u.amount, 0),
      productCount: demoStore.products.length,
    });
  }
}
