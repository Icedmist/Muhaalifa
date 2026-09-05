// Edge-compatible JWT verification using jose (middleware runs on edge).
import * as jose from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "muhaalifa-dev-secret-change-in-prod-32chars!");

export async function verifyJwtEdge(token: string){
  try {
    const { payload } = await jose.jwtVerify(token, secret);
    return payload as any;
  } catch { return null; }
}
