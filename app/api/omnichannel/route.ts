import { NextResponse } from "next/server";
import { omnichannelStore } from "@/lib/omnichannel-store";

export async function GET() {
  return NextResponse.json({
    orders: omnichannelStore.orders,
    abandonedCarts: omnichannelStore.abandonedCarts,
    approvals: omnichannelStore.approvals,
    wishlist: omnichannelStore.wishlist,
    integrations: omnichannelStore.integrations,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, id, payload } = body;

    if (action === "verify_cod") {
      const ord = omnichannelStore.orders.find((o) => o.id === id);
      if (ord) {
        ord.codVerified = true;
        ord.codRisk = "Low";
      }
      return NextResponse.json({ ok: true, order: ord });
    }

    if (action === "size_exchange") {
      const ord = omnichannelStore.orders.find((o) => o.id === id);
      if (ord && payload?.newSize) {
        ord.size = payload.newSize;
        ord.exchangeRequested = false;
        ord.courierStatus = "Packed";
      }
      return NextResponse.json({ ok: true, order: ord });
    }

    if (action === "qc_update") {
      const ord = omnichannelStore.orders.find((o) => o.id === id);
      if (ord && payload?.qcStatus) {
        ord.qcStatus = payload.qcStatus;
      }
      return NextResponse.json({ ok: true, order: ord });
    }

    if (action === "recover_cart") {
      const cart = omnichannelStore.abandonedCarts.find((c) => c.id === id);
      if (cart) cart.recovered = true;
      return NextResponse.json({ ok: true, cart });
    }

    if (action === "approval") {
      const app = omnichannelStore.approvals.find((a) => a.id === id);
      if (app && payload?.status) app.status = payload.status;
      return NextResponse.json({ ok: true, approval: app });
    }

    if (action === "add_wishlist") {
      const item = {
        id: `wish-${Date.now()}`,
        customerName: payload.customerName,
        phone: payload.phone,
        itemName: payload.itemName,
        size: payload.size,
        notified: false,
      };
      omnichannelStore.wishlist.unshift(item);
      return NextResponse.json({ ok: true, item });
    }

    if (action === "toggle_integration") {
      const integ = omnichannelStore.integrations.find((i) => i.id === id);
      if (integ) integ.connected = !integ.connected;
      return NextResponse.json({ ok: true, integration: integ });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Action failed" }, { status: 500 });
  }
}

