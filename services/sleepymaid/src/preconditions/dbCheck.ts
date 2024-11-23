import { SleepyMaidClient } from "../lib/SleepyMaidClient";
import { guildSettings, userData } from "@sleepymaid/db";
import { Context, Precondition, type CommandInteractionTypeUnion } from "@sleepymaid/handler";
export default class DBCheckPrecondtion extends Precondition<SleepyMaidClient> {
	public constructor(context: Context<SleepyMaidClient>) {
		super(context);
	}

	public override async CommandRun(interaction: CommandInteractionTypeUnion) {
		await this.container.drizzle.transaction(async (tx) => {
			if (interaction.guild)
				await tx
					.insert(guildSettings)
					.values({
						guildId: interaction.guild.id,
						guildName: interaction.guild.name,
						iconHash: interaction.guild.icon,
					})
					.onConflictDoUpdate({
						target: [guildSettings.guildId],
						set: {
							guildName: interaction.guild.name,
							iconHash: interaction.guild.icon,
						},
					});

			await tx
				.insert(userData)
				.values({
					userId: interaction.user.id,
					userName: interaction.user.username,
					displayName: interaction.user.displayName,
					avatarHash: interaction.user.avatar,
				})
				.onConflictDoUpdate({
					target: [userData.userId],
					set: {
						userName: interaction.user.username,
						displayName: interaction.user.displayName,
						avatarHash: interaction.user.avatar,
					},
				});
		});
	}
}
