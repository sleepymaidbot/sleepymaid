import { sessionTable } from "@sleepymaid/db";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { useSession } from "~/hooks/useSession";
import { db } from "~/utils/db";
import authMiddleware from "~/utils/middleware/auth";
import axios from "redaxios";
import { eq } from "drizzle-orm";
import { useQuery } from "@tanstack/react-query";
import { APIPartialGuild } from "discord-api-types/v10";

const getUserGuilds = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.handler(async () => {
		const session = await useSession();
		const sessionData = session.data;

		if (!sessionData) {
			throw new Error("Not authenticated");
		}

		const userSession = await db.query.sessionTable.findFirst({
			where: eq(sessionTable.id, sessionData.sessionId),
		});

		if (!userSession) {
			throw new Error("User session not found");
		}

		const guildsResponse = await axios.get("https://discord.com/api/v10/users/@me/guilds", {
			headers: {
				Authorization: `Bearer ${userSession.accessToken}`,
			},
		});

		const guilds: APIPartialGuild[] = guildsResponse.data;

		return guilds.map((guild) => ({
			id: guild.id,
			name: guild.name,
			icon: guild.icon,
		}));
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
	const query = useQuery({
		queryKey: ["guilds"],
		queryFn: () => getUserGuilds(),
	});

	if (query.isLoading) {
		return <div>Loading...</div>;
	}

	if (query.isError) {
		return <div>Error: {query.error.message}</div>;
	}

	return <div>Hello "/dashboard"! {JSON.stringify(query.data)}</div>;
}
