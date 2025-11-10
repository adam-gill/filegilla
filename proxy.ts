import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./lib/auth/auth";

const protectedRoutes = ["/u", "/test", "/note"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (isProtectedRoute) {
    if (!session) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }
  } else {
    if (pathname === "/" && session) {
      return NextResponse.redirect(new URL("/u", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};