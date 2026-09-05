import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { requirePermission } from "@/lib/auth";

export async function GET(){
  const db = readDb();
  return NextResponse.json({settings: db.settings});
}
export async function PUT(req: NextRequest){
  const auth = requirePermission(req, "settings:write");
  if("error" in auth) return auth.error;
  const body = await req.json();
  const db = readDb();
  db.settings = {...db.settings, ...body};
  // allow branches update explicitly
  if(Array.isArray(body.branches)) db.settings.branches = body.branches;
  writeDb(db);
  return NextResponse.json({settings: db.settings});
}
