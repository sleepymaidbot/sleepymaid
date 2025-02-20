import { createMiddleware } from "@tanstack/start";
import { useSession } from "~/hooks/useSession";

const authMiddleware = createMiddleware().server(async ({ next }) => {
	const session = await useSession();

	if (!session.data.sessionId) {
		throw new Error("Not authenticated (middleware)");
	}

	return next({
		sendContext: {
			sessionId: session.data.sessionId,
		},
	});
});

export default authMiddleware;
