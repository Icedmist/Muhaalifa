import { NextRequest, NextResponse } from "next/server";
import { verifyJwt, cookieName } from "@/lib/jwt";
import { readDb } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest){
  // Prefer JWT cookie, fallback to header (for backward compat)
  const cookieToken = req.cookies.get(cookieName())?.value;
  if(cookieToken){
    const payload = verifyJwt(cookieToken);
    if(payload) return NextResponse.json({user: payload});
  }
  const headerUser = getUserFromRequest(req);
  if(headerUser) return NextResponse.json({user: headerUser});
  // Also try to resolve from DB if cookie valid but expired? already handled
  return NextResponse.json({user: null}, {status: 401});
}
