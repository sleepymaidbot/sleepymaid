export type Permission = {
	name: string;
	description: string;
};

export const permissions: Record<string, Permission> = {
	"sleepymaid.admin": {
		name: "SleepyMaid Admin",
		description: "Administrator of SleepyMaid (Gives all permissions)",
	},
};

export const permissionKeys = Object.keys(permissions);
