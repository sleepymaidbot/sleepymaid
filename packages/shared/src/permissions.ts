export type PermissionObject = {
	name: string;
	description: string;
};

export const permissionList: Record<string, PermissionObject> = {
	"sleepymaid.admin": {
		name: "SleepyMaid Admin",
		description: "Administrator of SleepyMaid (Gives all permissions)",
	},
	/*
		Permissions
	*/
	"sleepymaid.permissions.roles.manage": {
		name: "Manage Role Permissions",
		description: "Manage role permissions",
	},
};

export const permissionKeys = Object.keys(permissionList);

export type Permission = (typeof permissionKeys)[number];
