import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { FloatingPillNavbar } from "@/components/Navbar";
import { ShopView } from "@/components/ShopView";

export default async function ShopPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const staffId = (session.user as { id?: string } | undefined)?.id;

  return (
    <>
      <FloatingPillNavbar />
      <ShopView staffId={staffId} />
    </>
  );
}
