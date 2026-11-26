import { NextResponse } from "next/server";
import { demoStore } from "@/lib/demo-store";
import { requireSession, sanitizeText, verifyCsrfOrigin } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = await requireSession("OWNER");
  if (error) return error;

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
  if (!verifyCsrfOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }
  const { error } = await requireSession("OWNER");
  if (error) return error;

  try {
    const body = await request.json();
    demoStore.shopProfile = {
      name: sanitizeText(body.name, 80) || demoStore.shopProfile.name,
      address: sanitizeText(body.address, 180) || demoStore.shopProfile.address,
      phone: sanitizeText(body.phone, 20) || demoStore.shopProfile.phone,
      tagline: sanitizeText(body.tagline, 160) || demoStore.shopProfile.tagline,
    };
    return NextResponse.json({ shopProfile: demoStore.shopProfile });
  } catch {
    return NextResponse.json(
      { error: "Shop profile update nahi ho paya." },
      { status: 500 }
    );
  }
}
