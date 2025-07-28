import { NextRequest, NextResponse } from 'next/server';

const protectedRoutes = [
  '/dashboard',
  '/account',
  '/passwords',
  '/view'
];

const publicRoutes = [
  '/',
  '/landing',
  '/signin',
  '/signup',
  '/privacy',
  '/terms'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );

  if (isProtectedRoute) {
    return NextResponse.next();
  }

  if (isPublicRoute) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 