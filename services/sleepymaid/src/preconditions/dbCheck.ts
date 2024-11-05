import { SleepyMaidClient } from "../lib/extensions/SleepyMaidClient";
import { guildSetting, userData } from "@sleepymaid/db";
import { Context, Precondition, type CommandInteractionTypeUnion } from "@sleepymaid/handler";
import { eq } from "drizzle-orm";

export default class DBCheckPrecondtion extends Precondition<SleepyMaidClient> {
	public constructor(context: Context<SleepyMaidClient>) {
		super(context);
	}

	public override async execute(interaction: CommandInteractionTypeUnion) {
		const client = this.container.client;
		if (interaction.guild) {
			const guild = interaction.guild;
			const guildId = guild.id;
			const guildSettings = await client.drizzle.query.guildSetting.findFirst({
				where: eq(guildSetting.guildId, guildId),
			});
			if (!guildSettings) {
				client.logger.info("No guild settings found, inserting...");
				await this.container.client.drizzle
					.insert(guildSetting)
					.values({ guildId: guild.id, guildName: guild.name, guildIcon: guild.iconURL() });
			}
		}
		if (interaction.user) {
			const user = interaction.user;
			const userId = user.id;
			const userDatas = await client.drizzle.query.userData.findFirst({
				where: eq(userData.userId, userId),
			});
			if (!userDatas) {
				client.logger.info("No user data found, inserting...");
				await this.container.client.drizzle
					.insert(userData)
					.values({ userId: user.id, userName: user.username, userAvatar: user.avatarURL() });
			}
		}
	}
}
