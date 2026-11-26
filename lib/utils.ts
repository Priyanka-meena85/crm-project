import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function isSameOrTomorrowMonthDay(date: Date | null | undefined): "today" | "tomorrow" | null {
  if (!date) return null;
  const now = new Date();
  const d = new Date(date);
  if (d.getMonth() === now.getMonth() && d.getDate() === now.getDate()) {
    return "today";
  }
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  if (d.getMonth() === tomorrow.getMonth() && d.getDate() === tomorrow.getDate()) {
    return "tomorrow";
  }
  return null;
}

export function daysSince(date: Date | string): number {
  const diff = Date.now() - new Date(date).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}
