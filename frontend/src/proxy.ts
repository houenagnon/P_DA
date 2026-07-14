import { NextRequest, NextResponse } from "next/server";
import { decodeJwt } from "jose";

const PUBLIC_PATHS = ["/", "/events", "/about", "/blog", "/portfolio", "/members", "/join"];
const AUTH_PATHS = ["/login", "/forgot-password", "/reset-password", "/verify-email"];

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function isAuthPage(pathname: string) {
  return AUTH_PATHS.some((p) => pathname.startsWith(p));
}

function getAccessTokenFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7);
  return req.cookies.get("access_token")?.value ?? null;
}

function isTokenExpired(token: string): boolean {
  try {
    const { exp } = decodeJwt(token);
    if (!exp) return true;
    return Date.now() / 1000 > exp;
  } catch {
    return true;
  }
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    isPublic(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = getAccessTokenFromRequest(req);
  const authenticated = token && !isTokenExpired(token);

  if (isAuthPage(pathname)) {
    if (authenticated) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  if (!authenticated) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
