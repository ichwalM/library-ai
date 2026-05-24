import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const adminEmails = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);

// ─── Proxy function (Next.js 16 replaces "middleware" naming) ─────────────────
export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const token = req.auth; // req.auth is the decoded JWT token

  // ─── Protect /admin routes ────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    const email = token.user?.email as string | undefined;
    if (!email || (adminEmails.length > 0 && !adminEmails.includes(email))) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  // ─── Protect /chat routes ─────────────────────────────────────────────────
  if (pathname.startsWith("/chat")) {
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/chat/:path*",
  ],
};
