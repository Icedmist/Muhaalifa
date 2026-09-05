import { NextRequest, NextResponse } from "next/server";
import { readDb } from "./db";
import { PERMISSIONS, hasPermission, type Role } from "./permissions";
import { verifyJwt, cookieName } from "./jwt";
export { PERMISSIONS, hasPermission };
export type { Role };

export function getUserFromRequest(req: NextRequest): { name: string; email: string; role: Role } | null {
  // 1) HttpOnly JWT cookie (primary, secure)
  const token = req.cookies.get(cookieName())?.value;
  if(token){
    const payload = verifyJwt(token);
    if(payload){
      // Re-validate against DB to ensure role not changed and user still exists
      const db = readDb();
      const person = db.staff.find(s=> s.email.toLowerCase()===payload.email.toLowerCase());
      if(person) return { name: person.name, email: person.email, role: person.role as Role };
      // fallback to payload if DB check fails (e.g. ephemeral FS)
      return { name: payload.name, email: payload.email, role: payload.role };
    }
  }
  // 2) Legacy header fallback (x-user-email) for backward compat / CLI tests
  const email = req.headers.get("x-user-email")?.trim().toLowerCase();
  if (email) {
    const db = readDb();
    const person = db.staff.find(s => s.email.toLowerCase() === email);
    if (person) return { name: person.name, email: person.email, role: person.role as Role };
  }
  return null;
}

export function requirePermission(
  req: NextRequest,
  permission: keyof typeof PERMISSIONS
): { user: { name: string; email: string; role: Role } } | { error: NextResponse } {
  const user = getUserFromRequest(req);
  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized — missing or unknown x-user-email. Sign in first." }, { status: 401 }) };
  }
  if (!hasPermission(user.role, permission)) {
    return { error: NextResponse.json({ error: `Forbidden — ${user.role} cannot perform ${permission}. Requires ${PERMISSIONS[permission].minRole}.` }, { status: 403 }) };
  }
  return { user };
}

// Helper for routes that allow unauthenticated read but want optional user context
export function optionalUser(req: NextRequest){
  return getUserFromRequest(req);
}
