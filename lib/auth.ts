import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { demoStore } from "@/lib/demo-store";

export const authOptions: NextAuthOptions = {
  secret:
    process.env.NEXTAUTH_SECRET ||
    "priya-boutique-nathdwara-super-secret-key-2026",
  session: {
    strategy: "jwt",
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
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email.toLowerCase().trim();
        const password = credentials.password;

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

        // Demo account fallback when PostgreSQL is not running locally
        if (password === "123456") {
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
