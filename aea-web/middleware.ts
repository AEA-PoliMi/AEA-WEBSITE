import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  });

  const isLoggedIn = !!token;
  const userRole = (token?.role as string | undefined) ?? undefined;

  const isDashboardArea = nextUrl.pathname.startsWith("/dashboard");
  const isAdminArea = nextUrl.pathname.startsWith("/dashboard/admin");

  if (isDashboardArea && !isLoggedIn) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  if (isAdminArea && userRole !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  if (nextUrl.pathname === "/auth-redirect") {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
    if (userRole === "admin") {
      return NextResponse.redirect(new URL("/dashboard/admin", nextUrl));
    } else {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth-redirect"],
};