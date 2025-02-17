import { sessionTable } from "@sleepymaid/db";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { useSession } from "~/hooks/useSession";
import { db } from "~/utils/db";
import authMiddleware from "~/utils/middleware/auth";
import axios from "redaxios";
import { eq } from "drizzle-orm";
import { useQuery } from "@tanstack/react-query";

const getUserGuilds = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async (ctx) => {
		const session = await useSession();
		const user = session.data.user;

		if (!user) {
			throw new Error("Not authenticated");
		}

		const userSession = await db.query.sessionTable.findFirst({
			where: eq(sessionTable.id, session.data.sessionId),
		});

		if (!userSession) {
			throw new Error("User session not found");
		}

		const guilds = await axios.get("https://discord.com/api/v10/users/@me/guilds", {
			headers: {
				Authorization: `Bearer ${userSession.accessToken}`,
			},
		});

		return guilds.data;
	});

export const Route = createFileRoute("/dashboard")({
	beforeLoad: async ({ context }) => {
		if (!context.user?.userId) {
			throw new Error("Not authenticated");
		}
	},
	errorComponent: ({ error }) => {
		if (error.message === "Not authenticated") {
			return redirect({ to: "/login" });
		}

		return <div>Error: {error.message}</div>;
	},
	component: DashboardComponent,
});

function DashboardComponent() {
	// const { user } = Route.useRouteContext()

	const { data: guilds } = useQuery({
		queryKey: ["guilds"],
		queryFn: () => getUserGuilds(),
	});

	return <div>Hello "/dashboard"! {JSON.stringify(guilds)}</div>;
}
