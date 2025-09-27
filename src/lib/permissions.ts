import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

// 1. Define all possible resources and actions in your application
const statement = {
  ...defaultStatements, // Includes default admin resources like 'user', 'session'
  member: [
    "create",
    "read-own",
    "read-all",
    "update-own",
    "update-all",
    "delete",
    "manage-spiritual-status",
  ],
  attendance: ["create-self", "create-all", "read"],
  worshipService: ["create", "read", "update", "delete"],
  event: ["create", "read", "update", "delete"],
  eventRegistration: ["create", "read", "delete"],
  ministrySchedule: ["create", "read", "update", "delete"],
  ministryReport: ["create", "read"], // For service reports
  pastoralNote: ["create", "read", "update"],
  announcement: ["create", "read", "update", "delete"],
  family: ["create", "read", "update", "delete"],
  zone: ["create", "read", "update", "delete"],
  rolePermission: ["create", "read", "update", "delete"], // For managing roles
} as const;

// 2. Create the Access Control instance
export const ac = createAccessControl(statement);

// 3. Define your roles and grant permissions

// Role: Jemaat Umum (Member)
export const member = ac.newRole({
  member: ["read-own", "update-own"], // Can see and update their own profile
  attendance: ["create-self", "read"], // Can mark their own attendance
  worshipService: ["read"],
  event: ["read"],
  eventRegistration: ["create"], // Can register for events
});
// Role: Servant (Penatalayan)
export const servant = ac.newRole({
  ...member.statements, // Manually include all permissions from the 'member' role
  attendance: [...member.statements.attendance, "create-all"], // Add 'create-all' to existing attendance permissions
  ministrySchedule: ["read", "update"],
  ministryReport: ["create", "read"],
});

// Role: Hamba Tuhan/Pendeta (Pastor)
export const pastor = ac.newRole({
  ...servant.statements, // Manually include all permissions from the 'servant' role
  member: [...servant.statements.member, "read-all", "manage-spiritual-status"],
  pastoralNote: ["create", "read", "update"],
  worshipService: ["create", "read", "update", "delete"], // Overwrites servant's read-only permission with full CRUD
  event: [...servant.statements.event, "update"],
  announcement: ["create", "update"],
});

// Role: Admin
export const admin = ac.newRole({
  ...adminAc.statements, // Inherit all default admin permissions from the plugin
  // Programmatically grant all actions for every custom resource you've defined
  ...Object.keys(statement).reduce((acc, resource) => {
    acc[resource as keyof typeof statement] = [
      "read-all",
      "create",
      "read",
      "update",
      "delete",
    ];
    return acc;
  }, {} as any),
});
