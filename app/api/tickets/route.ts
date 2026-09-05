import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import { genId, SERVICE_ETA_DAYS, Ticket } from "@/lib/constants";

export async function GET(req: NextRequest){
  const db = readDb();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const q = searchParams.get("q")?.toLowerCase();
  let list = db.tickets;
  if(status && status !== "all") list = list.filter(t=>t.status===status);
  if(q) list = list.filter(t=> t.id.toLowerCase().includes(q) || t.custName.toLowerCase().includes(q) || t.model.toLowerCase().includes(q) || t.custPhone.includes(q));
  // newest first
  list = [...list].sort((a,b)=> new Date(b.received).getTime() - new Date(a.received).getTime());
  return NextResponse.json({tickets:list, total: list.length});
}

export async function POST(req: NextRequest){
  const body = await req.json();
  const {
    brand, model, color, imei, photo,
    custName, custPhone, issue,
    service, amount, paid, expected, received, tech, status
  } = body;

  // minimal validation — most fields optional by design (walk-ins)
  if(!brand) return NextResponse.json({error:"Brand is required"}, {status:400});
  if(!service) return NextResponse.json({error:"Service is required"}, {status:400});

  const db = readDb();
  const id = genId();
  // ensure unique id (extremely low collision, but loop just in case)
  let finalId=id;
  let tries=0;
  while(db.tickets.some(t=>t.id===finalId) && tries<5){ finalId=genId(); tries++; }

  const now = new Date().toISOString();
  const expDays = SERVICE_ETA_DAYS[service] ?? 2;
  const expectedISO = expected ? new Date(expected).toISOString() : new Date(Date.now()+expDays*864e5).toISOString();

  const ticket: Ticket = {
    id: finalId,
    brand: brand || "Unspecified brand",
    model: model || "Unspecified model",
    color: color || "",
    imei: (imei||"").replace(/\D/g,"").slice(0,15),
    custName: custName||"",
    custPhone: custPhone||"",
    issue: issue||"",
    photo: photo||null,
    service,
    amount: Number(amount||0),
    paid: Number(paid||0),
    received: received ? new Date(received).toISOString() : now,
    expected: expectedISO,
    status: (status as Ticket["status"]) || "received",
    tech: tech || "MuhaAlifa",
  };

  db.tickets.unshift(ticket);
  writeDb(db);
  return NextResponse.json({ticket}, {status:201});
}
