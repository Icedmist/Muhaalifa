import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "muhaalifa-dev-secret-change-in-prod-32chars!";
const JWT_EXPIRES = "7d";
const COOKIE_NAME = "muha_token";

export type JwtPayload = {
  email: string;
  name: string;
  role: "Admin" | "Technician" | "Front Desk";
};

export function signJwt(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

export function verifyJwt(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export function cookieName(){ return COOKIE_NAME; }

export function cookieOptions(){
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60*60*24*7, // 7d
  }
}
