import { NextResponse } from "next/server";
import { demoStore } from "@/lib/demo-store";

export async function GET() {
  return NextResponse.json({
    shopProfile: demoStore.shopProfile,
    backup: {
      exportedAt: new Date().toISOString(),
      customers: demoStore.customers,
      products: demoStore.products,
      bills: demoStore.bills,
      udhaars: demoStore.udhaars,
      measurements: demoStore.measurements,
      staff: demoStore.staff,
    },
  });
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    demoStore.shopProfile = {
      name: body.name || demoStore.shopProfile.name,
      address: body.address || demoStore.shopProfile.address,
      phone: body.phone || demoStore.shopProfile.phone,
      tagline: body.tagline || demoStore.shopProfile.tagline,
    };
    return NextResponse.json({ shopProfile: demoStore.shopProfile });
  } catch {
    return NextResponse.json(
      { error: "Shop profile update nahi ho paya." },
      { status: 500 }
    );
  }
}
