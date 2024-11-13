export type PermissionObject = {
	name: string;
	description: string;
	default: boolean;
};

export const permissionList: Record<string, PermissionObject> = {
	"sleepymaid.admin": {
		name: "SleepyMaid Admin",
		description: "Administrator of SleepyMaid (Gives all permissions)",
		default: false,
	},
	/*
		Permissions
	*/
	"sleepymaid.permissions.roles.manage": {
		name: "Manage Role Permissions",
		description: "Manage role permissions",
		default: false,
	},
};

export const permissionKeys = Object.keys(permissionList);

export type Permission = (typeof permissionKeys)[number];
