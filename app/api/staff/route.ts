import { NextRequest, NextResponse } from "next/server";
import { readDb } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
export async function GET(req: NextRequest){
  const auth = requirePermission(req, "staff:read");
  if("error" in auth) return auth.error;
  const db=readDb();
  // strip sensitive fields before returning to frontend
  const staff = db.staff.map(({passwordHash, ...rest}: any) => rest);
  return NextResponse.json({staff});
}
