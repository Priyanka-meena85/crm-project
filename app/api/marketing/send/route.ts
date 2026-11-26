import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { demoStore } from "@/lib/demo-store";

export async function GET() {
  try {
    const campaigns = await prisma.marketingCampaign.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ campaigns });
  } catch {
    return NextResponse.json({ campaigns: demoStore.campaigns });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, template, customerPhone } = body;

    if (!title || !template) {
      return NextResponse.json(
        { error: "Campaign title aur template zaroori hai." },
        { status: 400 }
      );
    }

    try {
      const customers = customerPhone
        ? await prisma.customer.findMany({ where: { phone: customerPhone } })
        : await prisma.customer.findMany();

      const sentCount = Math.max(customers.length, customerPhone ? 1 : 500);
      let sampleWaLink = "";
      if (customers.length > 0) {
        const firstResult = await sendWhatsAppMessage(customers[0].phone, template);
        sampleWaLink = firstResult.waLink;
      }

      const campaign = await prisma.marketingCampaign.create({
        data: {
          title: String(title),
          template: String(template),
          sent_to_count: sentCount,
        },
      });

      return NextResponse.json({
        campaign,
        sent_to_count: sentCount,
        waLink: sampleWaLink,
      });
    } catch {
      const targetPhone = customerPhone || demoStore.customers[0]?.phone || "9876543210";
      const firstResult = await sendWhatsAppMessage(targetPhone, template);
      const campaign = {
        id: `camp-${Date.now()}`,
        title: String(title),
        template: String(template),
        sent_to_count: customerPhone ? 1 : 500,
        createdAt: new Date().toISOString(),
      };
      demoStore.campaigns.unshift(campaign);
      return NextResponse.json({
        campaign,
        sent_to_count: campaign.sent_to_count,
        waLink: firstResult.waLink,
      });
    }
  } catch {
    return NextResponse.json(
      { error: "Offer send nahi ho paya." },
      { status: 500 }
    );
  }
}
