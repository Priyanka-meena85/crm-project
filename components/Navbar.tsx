"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  CssArrowIcon,
  CssDiamondIcon,
  CssGridIcon,
  CssStoreIcon,
} from "@/components/CssIcons";
import { cn } from "@/lib/utils";

export function FloatingPillNavbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as { role?: string } | undefined)?.role || "STAFF";
  const userName = session?.user?.name || "Priya Boutique";

  return (
    <header className="sticky top-3 z-40 mx-auto max-w-6xl px-3 sm:px-6 pt-2">
      <motion.nav
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="flex flex-wrap items-center justify-between gap-3 rounded-full bg-white/80 backdrop-blur-xl px-4 sm:px-6 py-2.5 shadow-boutique border border-gold/35"
      >
        <Link href="/shop" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-maroon to-maroon-light text-gold-soft shadow-sm">
            <CssDiamondIcon />
          </div>
          <div className="leading-tight">
            <p className="font-serif text-sm sm:text-base font-bold text-maroon">
              Priya Boutique
            </p>
            <p className="text-[10px] font-medium text-gold uppercase tracking-widest">
              Nathdwara
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-1.5 rounded-full bg-ivory/90 p-1 border border-gold/30">
          <Link
            href="/shop"
            className={cn(
              "relative flex items-center gap-1.5 rounded-full px-3.5 sm:px-5 py-1.5 text-xs sm:text-sm font-semibold transition-all",
              pathname === "/shop"
                ? "bg-gradient-to-r from-maroon to-maroon-light text-white shadow-gold-glow"
                : "text-charcoal/75 hover:text-maroon"
            )}
          >
            <CssStoreIcon />
            <span>Shop View</span>
          </Link>

          {role === "OWNER" && (
            <Link
              href="/dashboard"
              className={cn(
                "relative flex items-center gap-1.5 rounded-full px-3.5 sm:px-5 py-1.5 text-xs sm:text-sm font-semibold transition-all",
                pathname === "/dashboard"
                  ? "bg-gradient-to-r from-maroon to-maroon-light text-white shadow-gold-glow"
                  : "text-charcoal/75 hover:text-maroon"
              )}
            >
              <CssGridIcon />
              <span>Owner Dashboard</span>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <span className="hidden md:inline-flex items-center gap-1.5 rounded-full bg-softpink px-3 py-1 text-xs font-semibold text-maroon border border-maroon/15">
            {userName} ({role})
          </span>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Logout"
            className="inline-flex items-center gap-1.5 rounded-full bg-ivory px-3 py-1.5 text-xs font-semibold text-maroon border border-gold/40 hover:bg-softpink transition-colors"
          >
            <CssArrowIcon />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </motion.nav>
    </header>
  );
}
