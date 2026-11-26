import crypto from "crypto";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

/* 1 & 2. Input Sanitization (XSS & Injection Defense) */
export function sanitizeText(input: unknown, maxLen = 500): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, maxLen);
}

/* 3. CSRF Origin Check for mutating requests */
export function verifyCsrfOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return true; // Same-origin server calls
  try {
    const originHost = new URL(origin).host;
    return originHost === host;
  } catch {
    return false;
  }
}

/* 5. SSRF Protection for External URLs */
export function isSafeExternalUrl(rawUrl: string): boolean {
  if (!rawUrl) return true;
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== "https:") return false;
    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname === "::1" ||
      hostname.startsWith("10.") ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("169.254.") ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/* 7. Sliding-Window Rate Limiter (Brute-Force Protection) */
const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  maxAttempts = 10,
  windowMs = 15 * 60 * 1000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitBuckets.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1 };
  }
  if (entry.count >= maxAttempts) {
    return { allowed: false, remaining: 0 };
  }
  entry.count += 1;
  return { allowed: true, remaining: maxAttempts - entry.count };
}

/* 6 & 10. Server-Side RBAC & BOLA/IDOR Guards */
export async function requireSession(requiredRole?: "OWNER" | "STAFF") {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      session: null,
    };
  }
  const user = session.user as { id?: string; role?: string; email?: string };
  if (requiredRole === "OWNER" && user.role !== "OWNER") {
    return {
      error: NextResponse.json({ error: "Forbidden: Owner access only" }, { status: 403 }),
      session: null,
    };
  }
  return { error: null, session: { ...session, user } };
}

/* 17. Webhook HMAC-SHA256 Signature Verification */
export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string
): boolean {
  if (!signatureHeader || !secret) return false;
  const expected =
    "sha256=" +
    crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const sigBuf = Buffer.from(signatureHeader);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length) return false;
  return crypto.timingSafeEqual(sigBuf, expBuf);
}

/* 19. Production-Safe Error Logger (No Sensitive Stack/Secrets) */
export function safeLogError(context: string, err: unknown) {
  if (process.env.NODE_ENV === "production") {
    console.error(`[CRM-ERROR] ${context}`);
  } else {
    console.error(`[CRM-ERROR] ${context}:`, err);
  }
}
