"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CssChatIcon, CssCloseIcon, CssCrownIcon } from "@/components/CssIcons";
import { cn } from "@/lib/utils";

/* 10. Floating Gold Dots Slow Moving Background */
export function FloatingGoldDots() {
  const dots = useMemo(
    () => [
      { id: 1, size: 180, top: "8%", left: "6%", duration: 18, delay: 0 },
      { id: 2, size: 240, top: "22%", left: "78%", duration: 22, delay: 2 },
      { id: 3, size: 140, top: "55%", left: "14%", duration: 16, delay: 1 },
      { id: 4, size: 210, top: "70%", left: "82%", duration: 24, delay: 3 },
      { id: 5, size: 120, top: "38%", left: "48%", duration: 20, delay: 1.5 },
      { id: 6, size: 160, top: "85%", left: "34%", duration: 19, delay: 0.8 },
    ],
    []
  );

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {dots.map((dot) => (
        <motion.div
          key={dot.id}
          initial={{ x: 0, y: 0, opacity: 0.25 }}
          animate={{
            x: [0, 35, -25, 18, 0],
            y: [0, -30, 20, -15, 0],
            opacity: [0.2, 0.36, 0.24, 0.32, 0.2],
          }}
          transition={{
            duration: dot.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: dot.delay,
          }}
          style={{
            width: dot.size,
            height: dot.size,
            top: dot.top,
            left: dot.left,
          }}
          className="absolute rounded-full bg-gradient-to-br from-gold-shine/30 to-gold/10 blur-3xl"
        />
      ))}
    </div>
  );
}

/* Marquee Strip */
export function MarqueeStrip() {
  const text =
    "Diwali Offer • New Stock Aaya Hai • VIP Customer • Priya Boutique Nathdwara • Shaadi Season Special • ";

  return (
    <div className="relative z-30 overflow-hidden bg-gradient-to-r from-maroon via-maroon-light to-maroon text-ivory py-1.5 border-b border-gold/40">
      <div className="flex whitespace-nowrap animate-marquee">
        <span className="text-xs sm:text-sm font-medium tracking-wider text-gold-soft px-4">
          {text} {text} {text}
        </span>
        <span className="text-xs sm:text-sm font-medium tracking-wider text-gold-soft px-4">
          {text} {text} {text}
        </span>
      </div>
    </div>
  );
}

/* Gold Line + Small Diamond Icon Divider */
export function GoldDivider({ label }: { label?: string }) {
  return (
    <div className="my-7 flex items-center gap-4">
      <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-gold/50 to-gold" />
      <div className="inline-flex items-center gap-2.5 rounded-full bg-white/80 px-4 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-maroon border border-gold/40 shadow-sm">
        <span className="inline-block h-2 w-2 rotate-45 bg-gold-shine" />
        {label ? <span>{label}</span> : null}
        {label ? <span className="inline-block h-2 w-2 rotate-45 bg-gold-shine" /> : null}
      </div>
      <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-gold/50 to-gold" />
    </div>
  );
}

/* 4. Count-Up Number Animation */
export function CountUpNumber({
  value,
  prefix = "",
  suffix = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame = 0;
    const totalFrames = 36;
    const startVal = 0;
    const increment = (value - startVal) / totalFrames;

    const timer = setInterval(() => {
      frame += 1;
      if (frame >= totalFrames) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.round(startVal + increment * frame));
      }
    }, 24);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {prefix}
      {display.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

/* 8. VIP Badge with Gold Shimmer */
export function VipBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "vip-shimmer inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-charcoal shadow-sm border border-yellow-300/70",
        className
      )}
    >
      <CssCrownIcon className="text-maroon" />
      VIP Gold
    </span>
  );
}

/* 9. WhatsApp Button with Continuous Pulse Ring */
export function WhatsAppButton({
  label,
  onClick,
  href,
  className,
}: {
  label: string;
  onClick?: () => void;
  href?: string;
  className?: string;
}) {
  const inner = (
    <motion.span
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 rounded-full bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-green-700 transition-colors cursor-pointer",
        className
      )}
    >
      <span className="absolute inset-0 rounded-full border-2 border-green-500 animate-pulse-ring pointer-events-none" />
      <CssChatIcon />
      <span>{label}</span>
    </motion.span>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className="inline-flex">
      {inner}
    </button>
  );
}

/* 3. Pill Button with Maroon Gradient + Gold Shine Sweep + Click Ripple */
export function BoutiqueButton({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
  className,
}: {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "outline" | "gold";
  disabled?: boolean;
  className?: string;
}) {
  const [ripple, setRipple] = useState<{ x: number; y: number; key: number } | null>(
    null
  );

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setRipple({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      key: Date.now(),
    });
    onClick?.(e);
  };

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={handleClick}
      whileHover={disabled ? undefined : { scale: 1.05 }}
      whileTap={disabled ? undefined : { scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 24 }}
      className={cn(
        "btn-gold-sweep relative inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden",
        variant === "primary" &&
          "bg-gradient-to-r from-maroon to-maroon-light text-white shadow-boutique hover:shadow-boutique-hover border border-gold/30",
        variant === "gold" &&
          "bg-gradient-to-r from-gold to-gold-shine text-charcoal shadow-boutique hover:shadow-gold-glow",
        variant === "outline" &&
          "bg-white/85 text-maroon border border-gold/50 hover:bg-softpink",
        className
      )}
    >
      {ripple && (
        <motion.span
          key={ripple.key}
          initial={{ scale: 0, opacity: 0.55 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.55 }}
          style={{ left: ripple.x, top: ripple.y }}
          className="pointer-events-none absolute h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-shine/50"
        />
      )}
      {children}
    </motion.button>
  );
}

/* 2. Boutique Card (28px rounded, Soft Shadow, 1px Gold Border on Hover, Lift 8px) */
export function BoutiqueCard({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 240,
        damping: 22,
        delay,
      }}
      whileHover={{
        y: -8,
        scale: 1.015,
      }}
      className={cn(
        "rounded-[28px] bg-white/90 backdrop-blur-md p-5 sm:p-6 shadow-boutique hover:shadow-boutique-hover border border-gold/25 hover:border-gold ring-1 ring-maroon/5 transition-all duration-300",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

/* 5. Gold Confetti Burst (40 Gold/Maroon particles) */
export function GoldConfettiBurst({ active }: { active: boolean }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 40 }).map((_, idx) => ({
        id: idx,
        left: `${(idx * 2.5 + (idx % 5) * 4) % 98}%`,
        delay: (idx % 8) * 0.06,
        duration: 1.8 + (idx % 5) * 0.35,
        rotate: (idx * 47) % 360,
        color:
          idx % 3 === 0
            ? "#F59E0B"
            : idx % 3 === 1
            ? "#881337"
            : "#FDE047",
        size: idx % 2 === 0 ? 10 : 7,
      })),
    []
  );

  return (
    <AnimatePresence>
      {active && (
        <div className="pointer-events-none fixed inset-0 z-[120] overflow-hidden">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ y: -30, opacity: 1, rotate: 0, scale: 1 }}
              animate={{
                y: "105vh",
                opacity: [1, 1, 0],
                rotate: p.rotate + 540,
                x: [0, p.id % 2 === 0 ? 35 : -35, 0],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                ease: "easeOut",
              }}
              style={{
                left: p.left,
                width: p.size,
                height: p.size * 1.4,
                backgroundColor: p.color,
              }}
              className="absolute top-0 rounded-sm shadow-sm"
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

/* 13. Modal with Scale + Fade + Backdrop Blur */
export function BoutiqueModal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-charcoal/45 backdrop-blur-md p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: "spring", stiffness: 320, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-[28px] bg-ivory border border-gold/50 shadow-boutique-hover p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-gold/30 pb-3 mb-4">
              <h3 className="font-serif text-xl font-bold text-maroon">
                {title}
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1.5 text-charcoal/70 hover:bg-softpink hover:text-maroon transition-colors"
              >
                <CssCloseIcon />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
