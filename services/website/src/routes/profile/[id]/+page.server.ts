import { db } from "$lib/server/db";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { eq } from "drizzle-orm";
import { userData } from "@sleepymaid/db";

export const load: PageServerLoad = async (event) => {
	const id = event.params.id;
	if (!id) {
		return redirect(302, "/login");
	}
	const [user] = await db.select().from(userData).where(eq(userData.userId, id));
	if (!user) {
		return redirect(302, "/login");
	}

	const partialProfile = {
		userId: user.userId,
		userName: user.userName,
		displayName: user.displayName,
		avatarHash: user.avatarHash,
		currency: user.currency,
	};

	if (event.locals.user?.userId !== id) {
		return {
			profile: partialProfile,
			user: event.locals.user,
		};
	}
	return {
		profile: partialProfile,
		fullProfile: user,
		user: event.locals.user,
	};
};
