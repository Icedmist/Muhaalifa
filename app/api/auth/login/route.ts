import { NextRequest, NextResponse } from "next/server";
import { readDb } from "@/lib/db";

export async function POST(req: NextRequest){
  const { email } = await req.json();
  const e = (email||"").trim().toLowerCase();
  if(!e) return NextResponse.json({error:"Email required"},{status:400});
  const db = readDb();
  const person = db.staff.find(s=> s.email.toLowerCase()===e);
  if(!person) return NextResponse.json({error:"We couldn't find an account with that email."},{status:404});
  // any password works in preview — only email matters
  return NextResponse.json({user:{name:person.name, role:person.role, email:person.email}});
}
