import { NextRequest, NextResponse } from "next/server";
import { readDb } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signJwt, cookieName, cookieOptions } from "@/lib/jwt";

export async function POST(req: NextRequest){
  const { email, password } = await req.json();
  const e = (email||"").trim().toLowerCase();
  if(!e) return NextResponse.json({error:"Email required"},{status:400});
  if(!password) return NextResponse.json({error:"Password required"},{status:400});
  const db = readDb();
  const person: any = db.staff.find(s=> s.email.toLowerCase()===e);
  if(!person) return NextResponse.json({error:"We couldn't find an account with that email."},{status:404});
  // Support both hashed and legacy plain (if passwordHash missing, allow any password for backward compat)
  if(person.passwordHash){
    const ok = await bcrypt.compare(String(password), person.passwordHash);
    if(!ok) return NextResponse.json({error:"Incorrect password."},{status:401});
  }
  const payload = { email: person.email, name: person.name, role: person.role as any };
  const token = signJwt(payload);
  const res = NextResponse.json({user: payload});
  res.cookies.set(cookieName(), token, cookieOptions());
  return res;
}
