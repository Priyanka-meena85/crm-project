"use client";

import React from "react";
import { motion } from "framer-motion";
import { BoutiqueCard } from "@/components/BoutiqueEffects";
import { formatINR } from "@/lib/utils";
import type { ReportsData } from "@/types/crm";

export function ReportsPanel({ reports }: { reports: ReportsData }) {
  const totalPayment = Math.max(
    1,
    reports.paymentBreakdown.UPI +
      reports.paymentBreakdown.Cash +
      reports.paymentBreakdown.Card +
      reports.paymentBreakdown.Udhaar
  );

  return (
    <div className="space-y-5">
      <BoutiqueCard>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-serif text-xl font-bold text-maroon">
              Weekly Sale Trend (Interactive)
            </h3>
            <p className="text-xs text-charcoal/70">
              Is hafte ki rozana showroom sale
            </p>
          </div>
          <span className="rounded-full bg-softpink px-3.5 py-1 text-xs font-bold text-maroon border border-gold/40">
            Monthly: {formatINR(reports.monthlySale)}
          </span>
        </div>
        <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-44 pt-4">
          {[
            { day: "Mon", val: 28000 },
            { day: "Tue", val: 34000 },
            { day: "Wed", val: 22000 },
            { day: "Thu", val: 41000 },
            { day: "Fri", val: 38000 },
            { day: "Sat", val: 52000 },
            { day: "Aaj", val: reports.dailySale },
          ].map((bar, idx) => {
            const maxVal = Math.max(55000, reports.dailySale);
            const hPct = Math.max(15, Math.round((bar.val / maxVal) * 100));
            return (
              <div
                key={bar.day}
                className="group flex flex-col items-center h-full justify-end gap-1.5"
              >
                <span className="text-[10px] font-bold text-maroon opacity-0 group-hover:opacity-100 transition-opacity">
                  {formatINR(bar.val)}
                </span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${hPct}%` }}
                  transition={{ duration: 0.7, delay: idx * 0.06 }}
                  className={`w-full max-w-[44px] rounded-t-2xl transition-colors ${
                    bar.day === "Aaj"
                      ? "bg-gradient-to-t from-maroon to-gold-shine shadow-gold-glow"
                      : "bg-gradient-to-t from-maroon/80 to-maroon-light/80 group-hover:from-maroon group-hover:to-gold"
                  }`}
                />
                <span className="text-xs font-semibold text-charcoal/80">
                  {bar.day}
                </span>
              </div>
            );
          })}
        </div>
      </BoutiqueCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <BoutiqueCard>
          <h3 className="font-serif text-lg font-bold text-maroon mb-3">
            Daily & Payment Mode Split
          </h3>
          <div className="space-y-3 text-sm">
            {[
              { label: "UPI", val: reports.paymentBreakdown.UPI, color: "bg-green-600" },
              { label: "Cash", val: reports.paymentBreakdown.Cash, color: "bg-maroon" },
              { label: "Card", val: reports.paymentBreakdown.Card, color: "bg-gold" },
              { label: "Udhaar", val: reports.paymentBreakdown.Udhaar, color: "bg-red-600" },
            ].map((pm) => {
              const pct = Math.round((pm.val / totalPayment) * 100);
              return (
                <div key={pm.label} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>{pm.label}</span>
                    <span>
                      {formatINR(pm.val)} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-ivory overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8 }}
                      className={`h-full rounded-full ${pm.color}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </BoutiqueCard>

        <BoutiqueCard>
          <h3 className="font-serif text-lg font-bold text-maroon mb-3">
            Item Wise Best Sellers
          </h3>
          <div className="space-y-2.5 text-sm">
            {reports.itemReport.map((item) => (
              <div
                key={item.name}
                className="flex justify-between rounded-xl bg-ivory/70 px-3 py-2 border border-gold/25"
              >
                <span>
                  {item.name} ({item.qty} pcs)
                </span>
                <strong className="text-maroon">{formatINR(item.revenue)}</strong>
              </div>
            ))}
          </div>
        </BoutiqueCard>

        <BoutiqueCard>
          <h3 className="font-serif text-lg font-bold text-maroon mb-3">
            Staff Wise Sale Report
          </h3>
          <div className="space-y-2 text-sm">
            {reports.staffReport.map((s) => (
              <div
                key={s.name}
                className="flex justify-between rounded-xl bg-ivory/70 px-3 py-2 border border-gold/25"
              >
                <span>
                  {s.name} ({s.role})
                </span>
                <strong className="text-maroon">
                  {formatINR(s.sale)} / {formatINR(s.target)}
                </strong>
              </div>
            ))}
          </div>
        </BoutiqueCard>

        <BoutiqueCard>
          <h3 className="font-serif text-lg font-bold text-maroon mb-3">
            Top Customers Report
          </h3>
          <div className="space-y-2 text-sm">
            {reports.customerReport.map((c) => (
              <div
                key={c.phone}
                className="flex justify-between rounded-xl bg-ivory/70 px-3 py-2 border border-gold/25"
              >
                <span>
                  {c.name} {c.is_vip ? "(VIP)" : ""}
                </span>
                <strong className="text-maroon">{formatINR(c.total)}</strong>
              </div>
            ))}
          </div>
        </BoutiqueCard>
      </div>
    </div>
  );
}
