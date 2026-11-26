"use client";

import React from "react";
import type { TabKey } from "@/types/crm";

export interface SidebarTabItem {
  key: TabKey;
  icon: React.ReactNode;
}

export function DashboardSidebar({
  tabs,
  activeTab,
  onSelect,
}: {
  tabs: SidebarTabItem[];
  activeTab: TabKey;
  onSelect: (tab: TabKey) => void;
}) {
  return (
    <aside className="w-full lg:w-64 shrink-0 lg:sticky lg:top-20 rounded-[24px] lg:rounded-[28px] bg-white/90 backdrop-blur-md p-2.5 sm:p-4 shadow-boutique border border-gold/40">
      <div className="flex items-center justify-between lg:hidden px-2 pb-1.5">
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-gold">
          Showroom Modules
        </span>
        <span className="text-[10px] font-semibold text-maroon/70">
          Swipe &rarr;
        </span>
      </div>
      <p className="hidden lg:block px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
        CRM & Leads
      </p>
      <div className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 snap-x snap-mandatory">
        {tabs.map((tab, idx) => (
          <React.Fragment key={tab.key}>
            {idx === 7 && (
              <p className="hidden lg:block px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
                Showroom Ops
              </p>
            )}
            {idx === 12 && (
              <p className="hidden lg:block px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
                Reports & Setup
              </p>
            )}
            <button
              type="button"
              onClick={() => onSelect(tab.key)}
              className={`snap-start shrink-0 inline-flex lg:w-full items-center gap-2 rounded-full lg:rounded-2xl px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold border transition-all ${
                activeTab === tab.key
                  ? "bg-gradient-to-r from-maroon to-maroon-light text-white border-gold shadow-gold-glow"
                  : "bg-ivory/60 text-charcoal border-transparent hover:border-gold/50 hover:bg-softpink/60"
              }`}
            >
              {tab.icon}
              <span>{tab.key}</span>
            </button>
          </React.Fragment>
        ))}
      </div>
    </aside>
  );
}
