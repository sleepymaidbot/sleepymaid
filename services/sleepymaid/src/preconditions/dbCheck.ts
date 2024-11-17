import { SleepyMaidClient } from "../lib/SleepyMaidClient";
import { guildSettings, userData } from "@sleepymaid/db";
import { Context, Precondition, type CommandInteractionTypeUnion } from "@sleepymaid/handler";
import { eq } from "drizzle-orm";

export default class DBCheckPrecondtion extends Precondition<SleepyMaidClient> {
	public constructor(context: Context<SleepyMaidClient>) {
		super(context);
	}

	public override async CommandRun(interaction: CommandInteractionTypeUnion) {
		const client = this.container.client;
		if (interaction.guild) {
			const guild = interaction.guild;
			const guildId = guild.id;
			const guildSetting = await client.drizzle.query.guildSettings.findFirst({
				where: eq(guildSettings.guildId, guildId),
			});
			if (!guildSetting) {
				client.logger.info("No guild settings found, inserting...");
				await this.container.client.drizzle.insert(guildSettings).values({
					guildId: guild.id,
					guildName: guild.name,
					guildIcon: guild.iconURL(),
				});
			} else {
				const updates: Partial<typeof guildSettings.$inferInsert> = {};
				if (guildSetting.guildIcon !== (guild.iconURL() || "")) {
					updates.guildIcon = guild.iconURL() || "";
				}
				if (guildSetting.guildName !== guild.name) {
					updates.guildName = guild.name;
				}
				if (Object.keys(updates).length > 0) {
					await this.container.client.drizzle
						.update(guildSettings)
						.set(updates)
						.where(eq(guildSettings.guildId, guildId));
				}
			}
		}

		const user = interaction.user;
		const userId = user.id;
		const userDatas = await client.drizzle.query.userData.findFirst({
			where: eq(userData.userId, userId),
		});
		if (!userDatas) {
			client.logger.info("No user data found, inserting...");
			await this.container.client.drizzle.insert(userData).values({
				userId: user.id,
				userName: user.username,
				displayName: user.displayName,
				avatarHash: user.avatar,
			});
		} else {
			const updates: Partial<typeof userData.$inferInsert> = {};
			if (userDatas.userName !== user.username) {
				updates.userName = user.username;
			}
			if (userDatas.avatarHash !== (user.avatar || "")) {
				updates.avatarHash = user.avatar || "";
			}
			if (userDatas.displayName !== user.displayName) {
				updates.displayName = user.displayName;
			}
			if (Object.keys(updates).length > 0) {
				await this.container.client.drizzle.update(userData).set(updates).where(eq(userData.userId, userId));
			}
		}
	}
}
