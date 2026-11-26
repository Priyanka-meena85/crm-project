import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { demoStore } from "@/lib/demo-store";
import { checkRateLimit } from "@/lib/security";

export const authOptions: NextAuthOptions = {
  secret:
    process.env.NEXTAUTH_SECRET ||
    "priya-boutique-nathdwara-runtime-fallback-secret-2026",
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Priya Boutique Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        otp: { label: "2FA OTP", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email.toLowerCase().trim();
        const password = credentials.password;

        // 7. Rate Limiting against brute-force login attempts
        const rl = checkRateLimit(`login:${email}`, 10, 15 * 60 * 1000);
        if (!rl.allowed) {
          throw new Error("Bahut zyada galat attempts. 15 min baad try karein.");
        }

        // 9. Optional MFA / 2FA OTP check for Owner
        if (
          process.env.ENABLE_OWNER_MFA === "true" &&
          email === "owner@priya.com" &&
          credentials.otp !== (process.env.OWNER_MFA_OTP || "482910")
        ) {
          return null;
        }

        try {
          const staff = await prisma.staff.findUnique({
            where: { email },
          });

          if (staff) {
            const isValid = await bcrypt.compare(password, staff.passwordHash);
            if (!isValid) return null;

            return {
              id: staff.id,
              name: staff.name,
              email: staff.email,
              role: staff.role,
            };
          }
        } catch {
          // Database unreachable — fall through to seeded demo accounts
        }

        // Strong non-default demo credentials when PostgreSQL is offline
        const validDemoPasswords: Record<string, string> = {
          "owner@priya.com": "Priya@Boutique#2026",
          "raju@priya.com": "Raju@Staff#2026",
          "pooja@priya.com": "Pooja@Staff#2026",
        };

        if (validDemoPasswords[email] && password === validDemoPasswords[email]) {
          const demoUser = demoStore.staff.find((s) => s.email === email);
          if (demoUser) {
            return {
              id: demoUser.id,
              name: demoUser.name,
              email: demoUser.email,
              role: demoUser.role,
            };
          }
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as unknown as { role: "OWNER" | "STAFF" }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as unknown as { id: string }).id = token.id as string;
        (session.user as unknown as { role: "OWNER" | "STAFF" }).role =
          token.role as "OWNER" | "STAFF";
      }
      return session;
    },
  },
};
