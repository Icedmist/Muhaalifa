import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { requirePermission } from "@/lib/auth";

export async function GET(_req: NextRequest, {params}:{params:{id:string}}){
  const db = readDb();
  const t = db.tickets.find(x=> x.id.toLowerCase()===params.id.toLowerCase());
  if(!t) return NextResponse.json({error:"Not found"}, {status:404});
  return NextResponse.json({ticket:t});
}

export async function PATCH(req: NextRequest, {params}:{params:{id:string}}){
  // status/payment updates require Technician+
  const auth = requirePermission(req, "tickets:update_status");
  if("error" in auth) return auth.error;
  const body = await req.json();
  const db = readDb();
  const t = db.tickets.find(x=> x.id.toLowerCase()===params.id.toLowerCase());
  if(!t) return NextResponse.json({error:"Not found"}, {status:404});

  const allowed = ["received","diagnosis","repair","awaiting-parts","ready","collected","cancelled"];
  if(body.status && allowed.includes(body.status)){
    t.status = body.status;
  }
  // allow partial updates (e.g. paid)
  if(typeof body.paid !== "undefined") t.paid = Number(body.paid);
  if(typeof body.amount !== "undefined") t.amount = Number(body.amount);
  if(body.tech) t.tech = body.tech;

  writeDb(db);
  return NextResponse.json({ticket:t});
}

export async function DELETE(req:NextRequest, {params}:{params:{id:string}}){
  const auth = requirePermission(req, "tickets:delete");
  if("error" in auth) return auth.error;
  const db = readDb();
  const idx=db.tickets.findIndex(x=>x.id.toLowerCase()===params.id.toLowerCase());
  if(idx===-1) return NextResponse.json({error:"Not found"},{status:404});
  db.tickets.splice(idx,1);
  writeDb(db);
  return NextResponse.json({ok:true});
}
