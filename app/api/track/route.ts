import { NextRequest, NextResponse } from "next/server";
import { readDb } from "@/lib/db";

export async function GET(req: NextRequest){
  const qRaw = new URL(req.url).searchParams.get("q")?.trim() || "";
  if(!qRaw) return NextResponse.json({ticket:null, matches:[]});
  const q = qRaw.toLowerCase();
  const db = readDb();

  const byId = db.tickets.find(t=> t.id.toLowerCase()===q);
  if(byId) return NextResponse.json({ticket:byId, matches:[]});

  const digits = qRaw.replace(/\D/g,"");
  if(digits.length>=6){
    const byPhone = db.tickets.filter(t=> t.custPhone.replace(/\D/g,"").includes(digits));
    if(byPhone.length===1) return NextResponse.json({ticket:byPhone[0], matches:[]});
    if(byPhone.length>1) return NextResponse.json({ticket:null, matches:byPhone});
  }
  // fuzzy search by id partial
  const partial = db.tickets.filter(t=> t.id.toLowerCase().includes(q));
  if(partial.length===1) return NextResponse.json({ticket:partial[0], matches:[]});
  if(partial.length>1) return NextResponse.json({ticket:null, matches:partial});
  return NextResponse.json({ticket:null, matches:[]});
}
