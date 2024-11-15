import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  if (token) {
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  } else {
    const protectedPaths = ["/dashboard", "/view", "/portal"];
    const pathMatches = protectedPaths.some((path) =>
      req.nextUrl.pathname.startsWith(path)
    );

    if (pathMatches) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/view/:path*", "/view"], // Protects /dashboard, /view and all subpaths, /portal
};
