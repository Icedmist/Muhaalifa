import { NextResponse } from "next/server";
import { readDb } from "@/lib/db";
export async function GET(){
  const db=readDb();
  const revenue = db.tickets.reduce((a,t)=>a+t.paid,0);
  const outstanding = db.tickets.reduce((a,t)=>a+(t.amount-t.paid),0);
  const active = db.tickets.filter(t=>t.status!=='collected'&&t.status!=='cancelled').length;
  const byService: Record<string,number>={};
  const byStatus: Record<string,number>={};
  db.tickets.forEach(t=>{ byService[t.service]=(byService[t.service]||0)+1; byStatus[t.status]=(byStatus[t.status]||0)+1; });
  return NextResponse.json({total:db.tickets.length, revenue, outstanding, active, byService, byStatus});
}
