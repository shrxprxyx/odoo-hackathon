import { auth } from "@/auth";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/signup"];

export default auth((req) => {
  const isPublic = PUBLIC_PATHS.includes(req.nextUrl.pathname);
  const isLoggedIn = !!req.auth;

  if (!isLoggedIn && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};