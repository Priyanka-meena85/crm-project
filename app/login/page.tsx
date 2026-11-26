"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  CssCrownIcon,
  CssDiamondIcon,
  CssDocIcon,
  CssUserIcon,
} from "@/components/CssIcons";
import { BoutiqueButton, BoutiqueCard, GoldDivider } from "@/components/BoutiqueEffects";
import { useToast } from "@/components/Providers";

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [email, setEmail] = useState("owner@priya.com");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (loginEmail: string, loginPass: string) => {
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: loginEmail,
        password: loginPass,
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
    <main className="mx-auto flex min-h-[calc(100vh-44px)] max-w-5xl flex-col items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 rounded-full bg-softpink px-4 py-1.5 text-xs font-semibold text-maroon border border-gold/40 mb-4"
        >
          <CssDiamondIcon className="text-gold" />
          <span>Priya Boutique • Nathdwara</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-serif text-4xl sm:text-5xl font-extrabold text-maroon tracking-tight"
        >
          Priya Boutique CRM
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-2 text-sm sm:text-base text-charcoal/80 font-medium"
        >
          &ldquo;Customer Kabhi Nahi Bhoolega, Sale Kabhi Nahi Rukegi&rdquo;
        </motion.p>
      </motion.div>

      <BoutiqueCard className="w-full max-w-md" delay={0.25}>
        <h2 className="font-serif text-2xl font-bold text-maroon text-center">
          Dukaan Login
        </h2>
        <p className="text-xs text-center text-charcoal/70 mt-1">
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
                className="w-full rounded-full border border-gold/40 bg-ivory/70 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-maroon focus:ring-2 focus:ring-gold/30 transition-all"
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
                className="w-full rounded-full border border-gold/40 bg-ivory/70 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-maroon focus:ring-2 focus:ring-gold/30 transition-all"
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
              setPassword("123456");
              handleLogin("owner@priya.com", "123456");
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
              setPassword("123456");
              handleLogin("raju@priya.com", "123456");
            }}
            className="w-full text-xs py-2.5"
          >
            <CssUserIcon className="text-maroon" />
            <span>Staff (Raju)</span>
          </BoutiqueButton>
        </div>

        <p className="mt-4 text-center text-[11px] text-charcoal/65">
          Demo: owner@priya.com / 123456 • raju@priya.com / 123456
        </p>
      </BoutiqueCard>
    </main>
  );
}
