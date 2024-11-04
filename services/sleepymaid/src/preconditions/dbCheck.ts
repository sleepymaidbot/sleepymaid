import { SleepyMaidClient } from "../lib/extensions/SleepyMaidClient";
import { guildsSettings } from "@sleepymaid/db";
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
			const guildSettings = await client.drizzle.query.guildsSettings.findFirst({
				where: eq(guildsSettings.guildId, guildId),
			});
			if (!guildSettings) {
				this.container.client.drizzle
					.insert(guildsSettings)
					.values({ guildId: guild.id, guildName: guild.name, guildIcon: guild.iconURL() });
			}
		}
		if (interaction.user) {
			// TODO: Implement user data
			// const user = interaction.user;
			// const userId = user.id;
			// const userSettings = await client.drizzle.query.users.findFirst({
			//     where: eq(guildsSettings.userId, userId),
			// });
			// if (!userSettings) {
			//     this.container.client.drizzle
			//         .insert(guildsSettings)
			//         .values({ userId: user.id, userName: user.username, userAvatar: user.avatarURL() });
			// }
		}
	}
}
