import type { Role } from "@/types";
import { PermissionError } from "./errors";

export type Action =
  | "workspace:read"
  | "workspace:edit"
  | "workspace:delete"
  | "member:invite"
  | "member:remove"
  | "member:role_change"
  | "connection:connect"
  | "connection:disconnect"
  | "post:create"
  | "post:edit"
  | "post:submit"
  | "post:approve"
  | "post:reject"
  | "post:publish"
  | "post:schedule"
  | "post:cancel"
  | "post:delete"
  | "media:upload"
  | "media:delete"
  | "report:view"
  | "audit:view";

const ROLE_PERMISSIONS: Record<Role, Set<Action>> = {
  owner: new Set<Action>([
    "workspace:read", "workspace:edit", "workspace:delete",
    "member:invite", "member:remove", "member:role_change",
    "connection:connect", "connection:disconnect",
    "post:create", "post:edit", "post:submit", "post:approve", "post:reject",
    "post:publish", "post:schedule", "post:cancel", "post:delete",
    "media:upload", "media:delete",
    "report:view", "audit:view",
  ]),
  admin: new Set<Action>([
    "workspace:read", "workspace:edit",
    "member:invite", "member:remove", "member:role_change",
    "connection:connect", "connection:disconnect",
    "post:create", "post:edit", "post:submit", "post:approve", "post:reject",
    "post:publish", "post:schedule", "post:cancel", "post:delete",
    "media:upload", "media:delete",
    "report:view", "audit:view",
  ]),
  editor: new Set<Action>([
    "workspace:read",
    "post:create", "post:edit", "post:submit",
    "media:upload",
    "report:view",
  ]),
  approver: new Set<Action>([
    "workspace:read",
    "post:approve", "post:reject", "post:publish",
    "report:view",
  ]),
  viewer: new Set<Action>([
    "workspace:read",
    "report:view",
  ]),
};

export function can(role: Role, action: Action): boolean {
  return ROLE_PERMISSIONS[role]?.has(action) ?? false;
}

export function assertCan(role: Role, action: Action): void {
  if (!can(role, action)) {
    throw new PermissionError(action);
  }
}
