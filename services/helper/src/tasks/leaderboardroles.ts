import { Context, Task } from "@sleepymaid/handler";
import { HelperClient } from "../lib/extensions/HelperClient";
import { userData } from "@sleepymaid/db";
import { desc } from "drizzle-orm";

const roles = {
	0: "1305566376496205935",
	1: "1305566419676827648",
	2: "1305566538476290171",
};

const role = "1305566315603300382";

export default class LeaderboardTask extends Task<HelperClient> {
	public constructor(context: Context<HelperClient>) {
		super(context, {
			interval: "*/5 * * * *",
			runOnStart: true,
		});
	}

	public override async execute() {
		const client = this.container.client;
		client.logger.debug("Leaderboard roles task started");

		const leaderboard = await client.drizzle.query.userData.findMany({
			orderBy: desc(userData.currency),
			limit: 5,
		});

		const guild = await client.guilds.fetch("862103656852619304");

		const members = await guild.members.fetch();

		for (const [_, member] of members) {
			if (leaderboard.find((user) => user.userId === member.id)) {
				const index = leaderboard.findIndex((user) => user.userId === member.id);
				const rolesSet = new Set(member.roles.cache.map((r) => r.id));
				for (const roleId of Object.values(roles)) {
					rolesSet.delete(roleId);
				}
				if (roles[index as keyof typeof roles]) rolesSet.add(roles[index as keyof typeof roles]);
				rolesSet.add(role);

				await member.roles.set(Array.from(rolesSet), "Leaderboard roles update");
			} else {
				await member.roles.remove([role, ...Object.values(roles)], "Leaderboard roles update");
			}
		}
	}
}
