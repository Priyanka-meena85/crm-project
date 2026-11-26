import { NextResponse } from "next/server";
import { UdhaarStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { demoStore } from "@/lib/demo-store";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    try {
      const udhaar = await prisma.udhaar.update({
        where: { id: params.id },
        data: { status: UdhaarStatus.Paid },
        include: { customer: true },
      });
      return NextResponse.json({ message: "Udhaar Paid mark ho gaya!", udhaar });
    } catch {
      const udhaar = demoStore.udhaars.find((u) => u.id === params.id);
      if (udhaar) udhaar.status = "Paid";
      return NextResponse.json({ message: "Udhaar Paid mark ho gaya!", udhaar });
    }
  } catch {
    return NextResponse.json(
      { error: "Udhaar update nahi ho paya." },
      { status: 500 }
    );
  }
}
