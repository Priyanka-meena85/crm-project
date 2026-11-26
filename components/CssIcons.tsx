"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface IconProps {
  className?: string;
}

/* Pure CSS Search Magnifier */
export function CssSearchIcon({ className }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("relative inline-block h-3.5 w-3.5 shrink-0", className)}
    >
      <span className="block h-2.5 w-2.5 rounded-full border-2 border-current" />
      <span className="absolute bottom-0 right-0 block h-1.5 w-0.5 origin-bottom-right -rotate-45 rounded-full bg-current" />
    </span>
  );
}

/* Pure CSS Plus */
export function CssPlusIcon({ className }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("relative inline-block h-3.5 w-3.5 shrink-0", className)}
    >
      <span className="absolute left-1/2 top-0.5 bottom-0.5 w-0.5 -translate-x-1/2 rounded-full bg-current" />
      <span className="absolute top-1/2 left-0.5 right-0.5 h-0.5 -translate-y-1/2 rounded-full bg-current" />
    </span>
  );
}

/* Pure CSS Minus */
export function CssMinusIcon({ className }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("relative inline-block h-3.5 w-3.5 shrink-0", className)}
    >
      <span className="absolute top-1/2 left-0.5 right-0.5 h-0.5 -translate-y-1/2 rounded-full bg-current" />
    </span>
  );
}

/* Pure CSS Close (X) */
export function CssCloseIcon({ className }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("relative inline-block h-4 w-4 shrink-0", className)}
    >
      <span className="absolute left-1/2 top-0.5 bottom-0.5 w-0.5 -translate-x-1/2 rotate-45 rounded-full bg-current" />
      <span className="absolute left-1/2 top-0.5 bottom-0.5 w-0.5 -translate-x-1/2 -rotate-45 rounded-full bg-current" />
    </span>
  );
}

/* Pure CSS Checkmark */
export function CssCheckIcon({ className }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block h-3.5 w-2 shrink-0 border-r-2 border-b-2 border-current rotate-45 -translate-y-0.5",
        className
      )}
    />
  );
}

/* Pure CSS Diamond / Sparkle */
export function CssDiamondIcon({ className }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block h-2.5 w-2.5 shrink-0 rotate-45 bg-current rounded-[2px]",
        className
      )}
    />
  );
}

/* Pure CSS Crown / VIP Emblem */
export function CssCrownIcon({ className }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("relative inline-flex items-end justify-center h-3.5 w-4 shrink-0", className)}
    >
      <span className="block w-3.5 h-2 border-b-2 border-l-2 border-r-2 border-current rounded-b-[2px]" />
      <span className="absolute top-0.5 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rotate-45 bg-current" />
    </span>
  );
}

/* Pure CSS Chat / WhatsApp Bubble */
export function CssChatIcon({ className }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative inline-block h-3.5 w-3.5 shrink-0 rounded-full border-2 border-current",
        className
      )}
    >
      <span className="absolute -bottom-0.5 -left-0.5 h-1.5 w-1.5 bg-current rotate-45 rounded-[1px]" />
    </span>
  );
}

/* Pure CSS Phone */
export function CssPhoneIcon({ className }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block h-3.5 w-2.5 shrink-0 rounded-[3px] border-2 border-current relative",
        className
      )}
    >
      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 w-1 bg-current rounded-full" />
    </span>
  );
}

/* Pure CSS Grid / Dashboard */
export function CssGridIcon({ className }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("inline-grid grid-cols-2 gap-0.5 h-3.5 w-3.5 shrink-0", className)}
    >
      <span className="rounded-[1px] bg-current" />
      <span className="rounded-[1px] bg-current" />
      <span className="rounded-[1px] bg-current" />
      <span className="rounded-[1px] bg-current" />
    </span>
  );
}

/* Pure CSS Store / Shop */
export function CssStoreIcon({ className }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("relative inline-block h-3.5 w-3.5 shrink-0", className)}
    >
      <span className="block h-1.5 w-3.5 border-2 border-current rounded-t-[2px]" />
      <span className="block mx-auto h-2 w-3 border-x-2 border-b-2 border-current" />
    </span>
  );
}

/* Pure CSS User */
export function CssUserIcon({ className }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("relative inline-flex flex-col items-center justify-center h-3.5 w-3.5 shrink-0 gap-0.5", className)}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      <span className="h-1.5 w-3 rounded-t-full bg-current" />
    </span>
  );
}

/* Pure CSS Bag */
export function CssBagIcon({ className }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("relative inline-flex flex-col items-center h-3.5 w-3.5 shrink-0", className)}
    >
      <span className="h-1 w-2 border-t-2 border-x-2 border-current rounded-t-full" />
      <span className="h-2.5 w-3 border-2 border-current rounded-[2px]" />
    </span>
  );
}

/* Pure CSS Receipt / Document */
export function CssDocIcon({ className }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex flex-col justify-center gap-0.5 px-0.5 h-3.5 w-3 shrink-0 border-2 border-current rounded-[2px]",
        className
      )}
    >
      <span className="h-0.5 w-full bg-current" />
      <span className="h-0.5 w-2/3 bg-current" />
    </span>
  );
}

/* Pure CSS Bar Chart */
export function CssChartIcon({ className }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("inline-flex items-end gap-0.5 h-3.5 w-3.5 shrink-0", className)}
    >
      <span className="w-1 h-1.5 bg-current rounded-t-[1px]" />
      <span className="w-1 h-3.5 bg-current rounded-t-[1px]" />
      <span className="w-1 h-2.5 bg-current rounded-t-[1px]" />
    </span>
  );
}

/* Pure CSS Alert Dot */
export function CssAlertIcon({ className }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex items-center justify-center h-3.5 w-3.5 shrink-0 rounded-full border-2 border-current text-[9px] font-bold leading-none",
        className
      )}
    >
      !
    </span>
  );
}

/* Pure CSS Arrow Right / Send */
export function CssArrowIcon({ className }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block h-2.5 w-2.5 shrink-0 border-t-2 border-r-2 border-current rotate-45",
        className
      )}
    />
  );
}

/* Pure CSS Download */
export function CssDownloadIcon({ className }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("relative inline-flex flex-col items-center justify-end h-3.5 w-3.5 shrink-0", className)}
    >
      <span className="h-2 w-0.5 bg-current" />
      <span className="h-1.5 w-1.5 border-r-2 border-b-2 border-current rotate-45 -mt-1.5 mb-0.5" />
      <span className="h-0.5 w-3 bg-current rounded-full" />
    </span>
  );
}

/* Pure CSS Gear / Settings */
export function CssGearIcon({ className }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block h-3.5 w-3.5 shrink-0 rounded-full border-[3px] border-dashed border-current",
        className
      )}
    />
  );
}

/* Pure CSS Trash */
export function CssTrashIcon({ className }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("relative inline-flex flex-col items-center h-3.5 w-3 shrink-0", className)}
    >
      <span className="h-0.5 w-3 bg-current rounded-full mb-0.5" />
      <span className="h-2.5 w-2.5 border-x-2 border-b-2 border-current rounded-b-[2px]" />
    </span>
  );
}

/* Pure CSS Edit / Pencil */
export function CssEditIcon({ className }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block h-3.5 w-1.5 shrink-0 border-2 border-current rotate-45 rounded-[1px]",
        className
      )}
    />
  );
}

/* Pure CSS Bell */
export function CssBellIcon({ className }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("relative inline-flex flex-col items-center h-3.5 w-3.5 shrink-0", className)}
    >
      <span className="h-2.5 w-2.5 border-2 border-current rounded-t-full" />
      <span className="h-0.5 w-3.5 bg-current rounded-full" />
      <span className="h-1 w-1 rounded-full bg-current" />
    </span>
  );
}
