import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { FloatingPillNavbar } from "@/components/Navbar";
import { OwnerDashboard } from "@/components/OwnerDashboard";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const role = (session.user as { role?: string } | undefined)?.role;
  if (role !== "OWNER") {
    redirect("/shop");
  }

  return (
    <>
      <FloatingPillNavbar />
      <OwnerDashboard />
    </>
  );
}
