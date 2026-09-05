import { NextRequest, NextResponse } from "next/server";
import { cookieName } from "./lib/jwt";

// Middleware runs on edge — do lightweight presence check only.
// Full JWT verification happens in API routes (Node). Here we just ensure cookie exists;
// if token is present but invalid, API will return 401 and client will redirect on next fetch.
// For role gate, we decode payload without verifying signature (edge safe).
function decodePayload(token: string): any | null {
  try {
    const parts = token.split(".");
    if(parts.length!==3) return null;
    const json = atob(parts[1].replace(/-/g,"+").replace(/_/g,"/"));
    return JSON.parse(json);
  } catch { return null; }
}

export function middleware(req: NextRequest){
  const path = req.nextUrl.pathname;
  const isProtected = path.startsWith("/dashboard") || path.startsWith("/admin");
  if(!isProtected) return NextResponse.next();

  const token = req.cookies.get(cookieName())?.value;
  if(!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }
  const payload = decodePayload(token);
  if(!payload?.email){
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    const res = NextResponse.redirect(url);
    res.cookies.set(cookieName(), "", { path:"/", maxAge: 0});
    return res;
  }
  // Role gate for /admin
  if(path.startsWith("/admin") && payload.role !== "Admin"){
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
