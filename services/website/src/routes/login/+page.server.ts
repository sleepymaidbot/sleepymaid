import { redirect } from "@sveltejs/kit";

import type { ServerLoad } from "@sveltejs/kit";

export const load: ServerLoad = async (event) => {
	if (event.locals.session !== null && event.locals.user !== null) {
		return redirect(302, "/");
	}
	return {};
};
