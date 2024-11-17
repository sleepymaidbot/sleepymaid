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
	if (event.locals.user?.userId !== id) {
		const profile = await db
			.select({
				userId: userData.userId,
				userName: userData.userName,
				displayName: userData.displayName,
				avatarHash: userData.avatarHash,
				currency: userData.currency,
			})
			.from(userData)
			.where(eq(userData.userId, id));
		if (profile.length < 1) {
			return redirect(302, "/login");
		}
		return { profile: profile[0], user: event.locals.user };
	}
	const profile = await db.select().from(userData).where(eq(userData.userId, id));
	return { profile: profile[0], user: event.locals.user };
};
