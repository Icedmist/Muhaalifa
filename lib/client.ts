"use client";
// Helper for API calls. JWT cookie is sent automatically (credentials:include).
// We still attach x-user-email as fallback for legacy paths / CLI.
// New code should rely on HttpOnly cookie; localStorage is for UI only.

export function authHeaders(): HeadersInit {
  try {
    const raw = localStorage.getItem("muha_session");
    if (!raw) return {};
    const s = JSON.parse(raw);
    if (!s?.email) return {};
    return {
      "x-user-email": s.email,
      "x-user-role": s.role,
    };
  } catch {
    return {};
  }
}

export async function authFetch(url: string, init: RequestInit = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...authHeaders(),
    ...(init.headers || {}),
  } as Record<string, string>;
  return fetch(url, { ...init, credentials: "include", headers });
}

export function getSession(): { name: string; role: "Admin" | "Technician" | "Front Desk"; email: string } | null {
  try {
    const raw = localStorage.getItem("muha_session");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}
