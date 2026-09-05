import { NextRequest, NextResponse } from "next/server";
import { readDb } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
export async function GET(req: NextRequest){
  const auth = requirePermission(req, "staff:read");
  if("error" in auth) return auth.error;
  const db=readDb();
  return NextResponse.json({staff: db.staff});
}
