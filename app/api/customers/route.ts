import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { daysSince } from "@/lib/utils";
import { demoStore } from "@/lib/demo-store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim() || "";

  try {
    const customers = await prisma.customer.findMany({
      where: search
        ? {
            OR: [
              { phone: { contains: search, mode: "insensitive" } },
              { name: { contains: search, mode: "insensitive" } },
              { city: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
      include: {
        bills: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { items: { include: { product: true } } },
        },
      },
      orderBy: { total_kharida: "desc" },
    });

    const enriched = customers.map((c) => {
      const inactiveDays = daysSince(c.last_visit);
      return {
        ...c,
        is_vip: c.is_vip || c.total_kharida > 50000,
        is_inactive: c.is_inactive || inactiveDays >= 90,
        lastItem:
          c.bills[0]?.items[0]?.product?.name ||
          (c.pasand ? c.pasand.split(",")[0] : "Kurti"),
      };
    });

    return NextResponse.json({ customers: enriched });
  } catch {
    const q = search.toLowerCase();
    const filtered = demoStore.customers.filter(
      (c) =>
        !q ||
        c.phone.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
    );
    return NextResponse.json({ customers: filtered });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, city, birthday, anniversary, size, pasand } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { error: "Customer ka Naam aur Phone number zaroori hai." },
        { status: 400 }
      );
    }

    try {
      const existing = await prisma.customer.findUnique({
        where: { phone: String(phone).trim() },
      });
      if (existing) {
        return NextResponse.json(
          { error: "Ye phone number pehle se registered hai!" },
          { status: 409 }
        );
      }

      const customer = await prisma.customer.create({
        data: {
          name: String(name).trim(),
          phone: String(phone).trim(),
          city: city ? String(city).trim() : "Nathdwara",
          birthday: birthday ? new Date(birthday) : null,
          anniversary: anniversary ? new Date(anniversary) : null,
          size: size || "M",
          pasand: pasand || "",
          total_kharida: 0,
          last_visit: new Date(),
          is_vip: false,
          is_inactive: false,
        },
      });
      return NextResponse.json({ customer }, { status: 201 });
    } catch {
      const existsDemo = demoStore.customers.find(
        (c) => c.phone === String(phone).trim()
      );
      if (existsDemo) {
        return NextResponse.json(
          { error: "Ye phone number pehle se registered hai!" },
          { status: 409 }
        );
      }
      const newCust = {
        id: `cust-${Date.now()}`,
        name: String(name).trim(),
        phone: String(phone).trim(),
        city: city ? String(city).trim() : "Nathdwara",
        birthday: birthday || null,
        anniversary: anniversary || null,
        size: size || "M",
        pasand: pasand || "",
        total_kharida: 0,
        last_visit: new Date().toISOString(),
        is_vip: false,
        is_inactive: false,
        lastItem: "New Customer",
      };
      demoStore.customers.unshift(newCust);
      return NextResponse.json({ customer: newCust }, { status: 201 });
    }
  } catch {
    return NextResponse.json(
      { error: "Customer save nahi ho paya." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, name, phone, city, size, pasand, birthday, anniversary } = body;
    if (!id) {
      return NextResponse.json({ error: "Customer ID zaroori hai." }, { status: 400 });
    }
    try {
      const customer = await prisma.customer.update({
        where: { id },
        data: {
          ...(name ? { name: String(name).trim() } : {}),
          ...(phone ? { phone: String(phone).trim() } : {}),
          ...(city ? { city: String(city).trim() } : {}),
          ...(size ? { size } : {}),
          ...(pasand !== undefined ? { pasand } : {}),
          ...(birthday ? { birthday: new Date(birthday) } : {}),
          ...(anniversary ? { anniversary: new Date(anniversary) } : {}),
        },
      });
      return NextResponse.json({ customer });
    } catch {
      const cust = demoStore.customers.find((c) => c.id === id);
      if (cust) {
        if (name) cust.name = String(name).trim();
        if (phone) cust.phone = String(phone).trim();
        if (city) cust.city = String(city).trim();
        if (size) cust.size = size;
        if (pasand !== undefined) cust.pasand = pasand;
        if (birthday) cust.birthday = birthday;
        if (anniversary) cust.anniversary = anniversary;
      }
      return NextResponse.json({ customer: cust });
    }
  } catch {
    return NextResponse.json({ error: "Customer update nahi ho paya." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Customer ID zaroori hai." }, { status: 400 });
  }
  try {
    await prisma.customer.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    demoStore.customers = demoStore.customers.filter((c) => c.id !== id);
    return NextResponse.json({ ok: true });
  }
}
