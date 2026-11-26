import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { demoStore } from "@/lib/demo-store";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    let udhaarData: {
      amount: number;
      due_date: Date | string;
      customer: { name: string; phone: string };
    } | null = null;

    try {
      udhaarData = await prisma.udhaar.findUnique({
        where: { id: params.id },
        include: { customer: true },
      });
    } catch {
      udhaarData = demoStore.udhaars.find((u) => u.id === params.id) || null;
    }

    if (!udhaarData) {
      return NextResponse.json(
        { error: "Udhaar entry nahi mili." },
        { status: 404 }
      );
    }

    const message = `Namaste ${udhaarData.customer.name} ji, Priya Boutique Nathdwara se yaad dila rahe hain ki aapka Rs. ${udhaarData.amount.toLocaleString("en-IN")} ka udhaar baki hai (Due Date: ${new Date(udhaarData.due_date).toLocaleDateString("en-IN")}). Kripya jaldi jama karwayein. Dhanyavaad!`;
    const waResult = await sendWhatsAppMessage(udhaarData.customer.phone, message);

    return NextResponse.json({
      message: "Reminder bhej diya gaya!",
      waLink: waResult.waLink,
      mode: waResult.mode,
    });
  } catch {
    return NextResponse.json(
      { error: "Reminder send nahi ho paya." },
      { status: 500 }
    );
  }
}
