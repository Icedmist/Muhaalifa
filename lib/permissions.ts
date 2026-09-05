export type Role = "Admin" | "Technician" | "Front Desk";

export const PERMISSIONS: Record<string, { label: string; minRole: Role; desc: string }> = {
  "tickets:read":   { label: "View tickets",        minRole: "Front Desk", desc: "List/search any ticket, view device & customer" },
  "tickets:create": { label: "Create tickets",      minRole: "Front Desk", desc: "Log a new repair via 4-step wizard, upload photo" },
  "tickets:update_status": { label: "Update status", minRole: "Technician", desc: "Move along pipeline (received → collected) + cancel. Front Desk is read-only." },
  "tickets:delete": { label: "Delete tickets",      minRole: "Admin",       desc: "Remove a ticket entirely (soft-delete recommended prod)" },
  "customers:read": { label: "View customers",      minRole: "Front Desk", desc: "See customer names/phones on tickets & track lookup" },
  "settings:read":  { label: "View settings",       minRole: "Front Desk", desc: "Read shop name/address/phone (used server-side for receipts)" },
  "settings:write": { label: "Edit shop branding",  minRole: "Admin",       desc: "Change name, address, footer, logo, accent, branches" },
  "services:read":  { label: "View catalog",        minRole: "Front Desk", desc: "List pricing & ETA map" },
  "services:write": { label: "Edit catalog",        minRole: "Admin",       desc: "Add/edit services & prices" },
  "staff:read":     { label: "View staff",          minRole: "Admin",       desc: "See staff directory & per-tech job counts" },
  "staff:write":    { label: "Manage staff",        minRole: "Admin",       desc: "Invite/remove, assign roles" },
  "stats:read":     { label: "View analytics",      minRole: "Admin",       desc: "Revenue, outstanding, active, byService/byStatus" },
  "admin:access":   { label: "Access Admin console",minRole: "Admin",      desc: "All admin tabs (overview, staff, catalog, branding, reminders)" },
};

const ROLE_RANK: Record<Role, number> = {
  "Front Desk": 1,
  "Technician": 2,
  "Admin": 3,
};

export function hasPermission(role: Role, permission: keyof typeof PERMISSIONS): boolean {
  const need = PERMISSIONS[permission].minRole;
  return ROLE_RANK[role] >= ROLE_RANK[need];
}
