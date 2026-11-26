import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Staff cannot access Owner Dashboard
    if (path.startsWith("/dashboard") && token?.role !== "OWNER") {
      return NextResponse.redirect(new URL("/shop", req.url));
    }

    return NextResponse.next();
  },
  {
    secret:
      process.env.NEXTAUTH_SECRET ||
      "priya-boutique-nathdwara-runtime-fallback-secret-2026",
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/shop/:path*", "/dashboard/:path*"],
};
