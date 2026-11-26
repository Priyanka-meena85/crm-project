import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { demoStore } from "@/lib/demo-store";

export async function GET() {
  try {
    const measurements = await prisma.measurement.findMany({
      include: { customer: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ measurements });
  } catch {
    return NextResponse.json({ measurements: demoStore.measurements });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customer_id,
      blouse,
      sleeve,
      length,
      waist,
      shoulder,
      status,
      delivery_date,
    } = body;

    if (!customer_id) {
      return NextResponse.json(
        { error: "Customer select karein." },
        { status: 400 }
      );
    }

    try {
      const measurement = await prisma.measurement.create({
        data: {
          customer_id,
          blouse: blouse || "",
          sleeve: sleeve || "",
          length: length || "",
          waist: waist || "",
          shoulder: shoulder || "",
          status: status || "Measurement Liya",
          delivery_date: delivery_date ? new Date(delivery_date) : null,
        },
        include: { customer: true },
      });
      return NextResponse.json({ measurement }, { status: 201 });
    } catch {
      const cust =
        demoStore.customers.find((c) => c.id === customer_id) ||
        demoStore.customers[0];
      const measurement = {
        id: `meas-${Date.now()}`,
        customer_id,
        blouse: blouse || "",
        sleeve: sleeve || "",
        length: length || "",
        waist: waist || "",
        shoulder: shoulder || "",
        status: status || "Measurement Liya",
        delivery_date: delivery_date || null,
        customer: { id: cust.id, name: cust.name, phone: cust.phone },
      };
      demoStore.measurements.unshift(measurement);
      return NextResponse.json({ measurement }, { status: 201 });
    }
  } catch {
    return NextResponse.json(
      { error: "Measurement save nahi ho paya." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "Measurement ID aur status zaroori hai." },
        { status: 400 }
      );
    }

    try {
      const measurement = await prisma.measurement.update({
        where: { id },
        data: { status },
        include: { customer: true },
      });
      return NextResponse.json({ measurement });
    } catch {
      const m = demoStore.measurements.find((x) => x.id === id);
      if (m) m.status = status;
      return NextResponse.json({ measurement: m });
    }
  } catch {
    return NextResponse.json(
      { error: "Measurement status update nahi ho paya." },
      { status: 500 }
    );
  }
}
