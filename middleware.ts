import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = ["/u", "/s", "/test"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  let sessionToken;

  // block test page in production
  if (process.env.NODE_ENV === "production" && pathname === "/test") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (process.env.NODE_ENV === "production") {
    sessionToken = request.cookies.get("__Secure-better-auth.session_token");
  } else {
    sessionToken = request.cookies.get("better-auth.session_token");
  }

  if (isProtectedRoute) {
    if (!sessionToken) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  } else {
    if (pathname === "/" && sessionToken) {
      return NextResponse.redirect(new URL("/u", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};