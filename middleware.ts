import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "better-auth.session_token";

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/") {
    const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
      return NextResponse.redirect(new URL("/landing", request.url));
    }
    return NextResponse.next();
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
