import sanitize from "@aero/sanitizer";
import { guildSetting } from "@sleepymaid/db";
import { Listener } from "@sleepymaid/handler";
import type { Context } from "@sleepymaid/handler";
import type { GuildMember } from "discord.js";
import { eq } from "drizzle-orm";
import type { SleepyMaidClient } from "../../lib/extensions/SleepyMaidClient";

export default class JoinSanitizerListener extends Listener<"guildMemberUpdate", SleepyMaidClient> {
	public constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			name: "guildMemberUpdate",
			once: false,
		});
	}

	public override async execute(oldMember: GuildMember, newMember: GuildMember) {
		if (newMember.user.bot) return;
		const client = this.container.client;
		const userRole = newMember.guild.roles.cache.map((role) => role.id);
		const guildSettings = await client.drizzle.query.guildSetting.findFirst({
			where: eq(guildSetting.guildId, newMember.guild.id),
		});
		if (!guildSettings) return;
		if (guildSettings.sanitizerEnabled === false) return;
		if (
			guildSettings.sanitizerIgnoredRoles.length &&
			guildSettings.sanitizerIgnoredRoles.some((role: string) => userRole.includes(role))
		)
			return;
		if (newMember.nickname !== null && oldMember.nickname !== newMember.nickname) {
			const sanitized = sanitize(newMember.nickname);
			if (newMember.nickname !== sanitized) await newMember.setNickname(sanitized, "Sanitizer");
		} else if (oldMember.displayName !== newMember.displayName) {
			const sanitized = sanitize(newMember.displayName);
			if (newMember.displayName !== sanitized) await newMember.setNickname(sanitized, "Sanitizer");
		}
	}
}
