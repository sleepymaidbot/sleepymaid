import { useSession as useSessionTanstack } from "@tanstack/start/server";

export function useSession() {
	return useSessionTanstack({
		password: process.env.SESSION_SECRET!,
		maxAge: 60 * 60 * 24 * 7,
	});
}
