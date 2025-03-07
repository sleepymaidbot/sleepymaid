import { sessionTable } from "@sleepymaid/db";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { useSession } from "~/hooks/useSession";
import { db } from "~/utils/db";
import authMiddleware from "~/utils/middleware/auth";
import axios from "redaxios";
import { eq } from "drizzle-orm";
import { useQuery } from "@tanstack/react-query";
import { APIPartialGuild } from "discord-api-types/v10";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { Input } from "~/components/ui/input";
import { useState } from "react";
import { Button } from "~/components/ui/button";

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
	const [searchTerm, setSearchTerm] = useState("");

	if (query.isLoading) {
		return <div>Loading...</div>;
	}

	if (query.isError) {
		return <div>Error: {query.error.message}</div>;
	}

	const guilds = query.data ?? [];
	const filteredGuilds = guilds.filter((guild) => guild.name.toLowerCase().includes(searchTerm.toLowerCase()));

	return (
		<div className="p-4">
			<div className="pb-4 text-2xl font-bold">Select a server!</div>
			<Input
				type="text"
				placeholder="Search servers..."
				value={searchTerm}
				onChange={(e) => setSearchTerm(e.target.value)}
				className="mb-4"
			/>
			<ScrollArea className="h-[500px] rounded-md border p-4">
				<div className="flex flex-col gap-2">
					{filteredGuilds.map((guild) => (
						<Link
							key={guild.id}
							to="/dashboard/$guildId"
							params={{
								guildId: guild.id,
							}}
						>
							<Button variant="outline" className="w-full justify-start">
								<div className="flex items-center gap-2 py-2">
									<Avatar className="h-10 w-10">
										<AvatarImage src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`} />
										<AvatarFallback>{guild.name.slice(0, 2)}</AvatarFallback>
									</Avatar>
									<div>{guild.name}</div>
								</div>
							</Button>
						</Link>
					))}
				</div>
			</ScrollArea>
		</div>
	);
}
