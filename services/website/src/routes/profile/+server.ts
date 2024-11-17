import { redirect } from "@sveltejs/kit";
import type { RequestEvent } from "@sveltejs/kit";

export async function GET(event: RequestEvent): Promise<Response> {
	if (event.locals.session === null || event.locals.user === null || event.locals.user === undefined) {
		throw redirect(302, "/login");
	}
	throw redirect(302, "/profile/" + event.locals.user.userId);
}
