import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { useSession } from "~/hooks/useSession";

export const logoutFn = createServerFn({ method: "GET" }).handler(async () => {
	console.log("logoutFn");
	const session = await useSession();

	if (!session.data) {
		throw new Error("Not authenticated");
	}

	await session.clear();

	throw redirect({ to: "/" });
});
