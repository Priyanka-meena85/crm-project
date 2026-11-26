"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CssCheckIcon,
  CssCrownIcon,
  CssDiamondIcon,
  CssDocIcon,
  CssUserIcon,
} from "@/components/CssIcons";
import { BoutiqueButton, GoldDivider } from "@/components/BoutiqueEffects";
import { useToast } from "@/components/Providers";

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [email, setEmail] = useState("owner@priya.com");
  const [password, setPassword] = useState("Priya@Boutique#2026");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (loginEmail: string, loginPass: string) => {
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: loginEmail,
        password: loginPass,
        otp,
        redirect: false,
      });

      if (res?.error) {
        showToast("Galat email ya password!", "error");
        setLoading(false);
        return;
      }

      showToast("Swagat hai Priya Boutique CRM me!");
      if (loginEmail.toLowerCase().includes("owner")) {
        router.push("/dashboard");
      } else {
        router.push("/shop");
      }
      router.refresh();
    } catch {
      showToast("Login me dikkat aayi.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-44px)] max-w-5xl items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid w-full grid-cols-1 lg:grid-cols-12 overflow-hidden rounded-[32px] bg-white/90 backdrop-blur-md shadow-boutique-hover border border-gold/45"
      >
        {/* Left Editorial Brand Showcase */}
        <div className="lg:col-span-5 bg-gradient-to-br from-maroon via-maroon-light to-maroon-dark p-8 sm:p-10 text-ivory flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-[11px] font-bold uppercase tracking-widest text-gold-soft border border-gold/40">
              <CssDiamondIcon className="text-gold-shine" />
              <span>Nathdwara Flagship</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold leading-tight">
              Priya Boutique CRM
            </h1>
            <p className="text-sm text-gold-soft/90 leading-relaxed">
              &ldquo;Customer Kabhi Nahi Bhoolega, Sale Kabhi Nahi Rukegi&rdquo;
            </p>
          </div>

          <div className="mt-8 space-y-3 relative z-10 text-xs text-gold-soft/95">
            {[
              "3-Step Fast Billing + Gold Confetti + PDF",
              "VIP Customer DNA, Size & Alteration Diary",
              "Kanban Pipeline, Follow-ups & 24x7 AI",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold-shine/20 text-gold-shine border border-gold-shine/40">
                  <CssCheckIcon />
                </span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Login Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 bg-ivory/60">
          <h2 className="font-serif text-2xl font-bold text-maroon">
            Dukaan Login
          </h2>
          <p className="text-xs text-charcoal/70 mt-1">
            Owner ya Staff account se login karein
          </p>

          <GoldDivider label="Account Details" />

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin(email, password);
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-semibold text-maroon mb-1.5">
                Email ID
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold flex items-center">
                  <CssDocIcon />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@priya.com"
                  className="w-full rounded-full border border-gold/40 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-maroon focus:ring-2 focus:ring-gold/30 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-maroon mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold flex items-center">
                  <CssUserIcon />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full rounded-full border border-gold/40 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-maroon focus:ring-2 focus:ring-gold/30 transition-all"
                />
              </div>
            </div>

            <BoutiqueButton
              type="submit"
              disabled={loading}
              className="w-full py-3 text-base"
            >
              {loading ? "Login Ho Raha Hai..." : "Andar Aayein"}
            </BoutiqueButton>
          </form>

          <GoldDivider label="1-Click Demo Login" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <BoutiqueButton
              variant="gold"
              disabled={loading}
              onClick={() => {
                setEmail("owner@priya.com");
                setPassword("Priya@Boutique#2026");
                handleLogin("owner@priya.com", "Priya@Boutique#2026");
              }}
              className="w-full text-xs py-2.5"
            >
              <CssCrownIcon className="text-maroon" />
              <span>Owner (Priya)</span>
            </BoutiqueButton>

            <BoutiqueButton
              variant="outline"
              disabled={loading}
              onClick={() => {
                setEmail("raju@priya.com");
                setPassword("Raju@Staff#2026");
                handleLogin("raju@priya.com", "Raju@Staff#2026");
              }}
              className="w-full text-xs py-2.5"
            >
              <CssUserIcon className="text-maroon" />
              <span>Staff (Raju)</span>
            </BoutiqueButton>
          </div>

          <div className="mt-4">
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="2FA OTP (Optional - if MFA enabled)"
              className="w-full rounded-full border border-gold/30 bg-white/80 px-4 py-1.5 text-center text-xs outline-none focus:border-maroon"
            />
          </div>

          <p className="mt-3 text-center text-[11px] text-charcoal/65">
            Demo: owner@priya.com / Priya@Boutique#2026 • raju@priya.com / Raju@Staff#2026
          </p>
        </div>
      </motion.div>
    </main>
  );
}
