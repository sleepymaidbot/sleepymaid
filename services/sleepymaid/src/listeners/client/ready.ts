/* eslint-disable id-length */
import { guildsSettings } from "@sleepymaid/db";
import type { Context } from "@sleepymaid/handler";
import { Listener } from "@sleepymaid/handler";
import type { Guild } from "discord.js";
import { eq } from "drizzle-orm";
import type { SleepyMaidClient } from "@/lib/extensions/SleepyMaidClient";

export default class ReadyListener extends Listener<"ready", SleepyMaidClient> {
	public constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			name: "ready",
			once: true,
		});
	}

	public override async execute() {
		const client = this.container.client;
		client.logger.info(
			`Logged in as ${this.container.client.user!.tag} | ${this.container.client.guilds.cache.size} servers`,
		);

		const guilds = await client.guilds.fetch();
		for (const guild of guilds.values()) {
			const g: Guild = await client.guilds.fetch(guild.id);

			await g.members.fetch().catch((error) => client.logger.error(error));
		}

		const guildSettings = await client.drizzle.select().from(guildsSettings);

		const guildsInDb = guildSettings.map((guild) => guild.guildId);

		const notInDbGuilds = client.guilds.cache
			.filter((g) => !guildsInDb.includes(g.id))
			.map((g) => {
				return { guildId: g.id, guildName: g.name, guildIcon: g.iconURL() };
			});

		if (notInDbGuilds.length !== 0) {
			await client.drizzle.insert(guildsSettings).values(notInDbGuilds);
		}

		await client.drizzle.transaction(async (trx) => {
			for (const guild of guildSettings) {
				if (!guild.guildName) {
					const g: Guild = await client.guilds.fetch(guild.guildId);
					await trx
						.update(guildsSettings)
						.set({ guildIcon: g.iconURL(), guildName: g.name })
						.where(eq(guildsSettings.guildId, guild.guildId));
				}
			}
		});
	}
}
