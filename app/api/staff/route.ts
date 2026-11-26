import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { demoStore } from "@/lib/demo-store";

export async function GET() {
  try {
    const staffList = await prisma.staff.findMany({
      orderBy: { current_sale: "desc" },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        target_monthly: true,
        commission_percent: true,
        current_sale: true,
      },
    });
    return NextResponse.json({ staff: staffList });
  } catch {
    return NextResponse.json({ staff: demoStore.staff });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, email, role, target_monthly, commission_percent } = body;

    if (!name || !phone || !email) {
      return NextResponse.json(
        { error: "Name, phone aur email zaroori hai." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash("123456", 10);

    try {
      const staff = await prisma.staff.create({
        data: {
          name: String(name).trim(),
          phone: String(phone).trim(),
          email: String(email).toLowerCase().trim(),
          passwordHash,
          role: role === "OWNER" ? UserRole.OWNER : UserRole.STAFF,
          target_monthly: Number(target_monthly || 100000),
          commission_percent: Number(commission_percent || 2),
          current_sale: 0,
        },
      });
      return NextResponse.json({ staff }, { status: 201 });
    } catch {
      const staff = {
        id: `staff-${Date.now()}`,
        name: String(name).trim(),
        phone: String(phone).trim(),
        email: String(email).toLowerCase().trim(),
        role: (role === "OWNER" ? "OWNER" : "STAFF") as "OWNER" | "STAFF",
        target_monthly: Number(target_monthly || 100000),
        commission_percent: Number(commission_percent || 2),
        current_sale: 0,
        attendance: "Present" as const,
      };
      demoStore.staff.push(staff);
      return NextResponse.json({ staff }, { status: 201 });
    }
  } catch {
    return NextResponse.json(
      { error: "Staff add nahi ho paya." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, attendance } = body;
    const staff = demoStore.staff.find((s) => s.id === id);
    if (staff && attendance) {
      staff.attendance = attendance;
    }
    return NextResponse.json({ staff });
  } catch {
    return NextResponse.json({ error: "Attendance update failed." }, { status: 500 });
  }
}
