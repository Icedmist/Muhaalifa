"use client";
// Helper to attach auth headers from localStorage for API RBAC enforcement.
// In production, swap for HttpOnly cookie / JWT + middleware.

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
  // Don't duplicate Content-Type if body is FormData
  return fetch(url, { ...init, headers });
}

export function getSession(): { name: string; role: "Admin" | "Technician" | "Front Desk"; email: string } | null {
  try {
    const raw = localStorage.getItem("muha_session");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}
