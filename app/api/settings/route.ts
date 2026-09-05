import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";

export async function GET(){
  const db = readDb();
  return NextResponse.json({settings: db.settings});
}
export async function PUT(req: NextRequest){
  const body = await req.json();
  const db = readDb();
  db.settings = {...db.settings, ...body};
  // allow branches update explicitly
  if(Array.isArray(body.branches)) db.settings.branches = body.branches;
  writeDb(db);
  return NextResponse.json({settings: db.settings});
}
