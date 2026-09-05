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
  const body = await req.json().catch(()=>({}));
  const db = readDb();
  const t = db.tickets.find(x=> x.id.toLowerCase()===params.id.toLowerCase());
  if(!t) return NextResponse.json({error:"Not found"}, {status:404});

  // payments do not require status permission — Front Desk can mark paid
  if(typeof body.addPayment !== "undefined"){
    const authPay = requirePermission(req, "tickets:create");
    if("error" in authPay) return authPay.error;
    const amt = Number(body.addPayment);
    if(!amt || amt<=0) return NextResponse.json({error:"Invalid payment amount"}, {status:400});
    if(!t.payments) t.payments = [];
    if(!t.history) t.history = [];
    t.payments.push({ amount: amt, at: new Date().toISOString(), by: authPay.user.email, method: body.paymentMethod || "cash" });
    t.paid = (t.payments || []).reduce((a,p)=> a + Number(p.amount||0), 0);
    writeDb(db);
    return NextResponse.json({ticket:t});
  }

  // status updates require Technician+
  const auth = requirePermission(req, "tickets:update_status");
  if("error" in auth) return auth.error;
  // migrate existing tickets lacking history/payments
  if(!t.history) t.history = [];
  if(!t.payments) t.payments = [];

  const allowed = ["received","diagnosis","repair","awaiting-parts","ready","collected","cancelled"];
  if(body.status && allowed.includes(body.status) && body.status !== t.status){
    const from = t.status;
    t.status = body.status;
    t.history.push({ from, to: body.status, at: new Date().toISOString(), by: auth.user.email, note: body.note });
    // audit: increment staff ticket count? not needed
  }
  // allow partial updates (e.g. amount)
  if(typeof body.amount !== "undefined"){
    // only Admin/Technician can edit amount via same gate (update_status)
    t.amount = Number(body.amount);
  }
  if(body.tech) t.tech = body.tech;
  if(body.branch) t.branch = body.branch;

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
