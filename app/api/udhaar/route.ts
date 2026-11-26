import { NextResponse } from "next/server";
import { UdhaarStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { demoStore } from "@/lib/demo-store";

export async function GET() {
  try {
    const udhaars = await prisma.udhaar.findMany({
      include: { customer: true },
      orderBy: [{ status: "asc" }, { due_date: "asc" }],
    });
    return NextResponse.json({ udhaars });
  } catch {
    return NextResponse.json({ udhaars: demoStore.udhaars });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer_id, amount, due_date } = body;

    if (!customer_id || !amount) {
      return NextResponse.json(
        { error: "Customer aur Udhaar amount zaroori hai." },
        { status: 400 }
      );
    }

    const due = due_date
      ? new Date(due_date)
      : new Date(Date.now() + 7 * 86400000);

    try {
      const udhaar = await prisma.udhaar.create({
        data: {
          customer_id,
          amount: Number(amount),
          due_date: due,
          status: UdhaarStatus.Pending,
        },
        include: { customer: true },
      });
      return NextResponse.json({ udhaar }, { status: 201 });
    } catch {
      const cust =
        demoStore.customers.find((c) => c.id === customer_id) ||
        demoStore.customers[0];
      const udhaar = {
        id: `udh-${Date.now()}`,
        customer_id: cust.id,
        amount: Number(amount),
        due_date: due.toISOString(),
        status: "Pending" as const,
        customer: { name: cust.name, phone: cust.phone },
      };
      demoStore.udhaars.unshift(udhaar);
      return NextResponse.json({ udhaar }, { status: 201 });
    }
  } catch {
    return NextResponse.json(
      { error: "Udhaar add nahi ho paya." },
      { status: 500 }
    );
  }
}
