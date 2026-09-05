import { NextRequest, NextResponse } from "next/server";
import { readDb } from "./db";
import { PERMISSIONS, hasPermission, type Role } from "./permissions";
export { PERMISSIONS, hasPermission };
export type { Role };

export function getUserFromRequest(req: NextRequest): { name: string; email: string; role: Role } | null {
  // MVP: client sends x-user-email header (set from localStorage after login).
  // Prod: replace with HttpOnly cookie / JWT + middleware verification.
  const email = req.headers.get("x-user-email")?.trim().toLowerCase();
  const roleHeader = req.headers.get("x-user-role") as Role | null;
  if (!email) return null;
  const db = readDb();
  const person = db.staff.find(s => s.email.toLowerCase() === email);
  if (!person) return null;
  // Trust DB role over header to prevent privilege escalation
  return { name: person.name, email: person.email, role: person.role as Role };
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
