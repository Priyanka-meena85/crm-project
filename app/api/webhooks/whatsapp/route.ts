import { NextResponse } from "next/server";
import { verifyWebhookSignature, safeLogError } from "@/lib/security";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-hub-signature-256");
    const secret = process.env.WHATSAPP_APP_SECRET || "";

    if (!verifyWebhookSignature(rawBody, signature, secret)) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 }
      );
    }

    const payload = JSON.parse(rawBody);
    return NextResponse.json({ received: true, entries: payload?.entry?.length || 0 });
  } catch (err) {
    safeLogError("WhatsApp Webhook", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 400 });
  }
}
