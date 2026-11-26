import { NextResponse } from "next/server";
import { omnichannelStore } from "@/lib/omnichannel-store";

export async function GET() {
  return NextResponse.json({ threads: omnichannelStore.inbox });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { threadId, text, orderAction } = body;

    const thread = omnichannelStore.inbox.find((t) => t.id === threadId);
    if (!thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    if (text) {
      thread.messages.push({
        id: `m-${Date.now()}`,
        sender: "agent",
        text,
        time: "Just now",
      });
      thread.unread = false;
    }

    if (orderAction) {
      thread.orderStatus =
        orderAction === "cancel"
          ? "Cancelled"
          : orderAction === "refund"
          ? "Instant Refund Triggered (Razorpay)"
          : "Live Tracking Sent";
      thread.messages.push({
        id: `m-act-${Date.now()}`,
        sender: "agent",
        text: `[System Action] Order #${thread.orderNo}: ${thread.orderStatus}`,
        time: "Just now",
      });
    }

    return NextResponse.json({ thread });
  } catch {
    return NextResponse.json({ error: "Message failed" }, { status: 500 });
  }
}

