import type { ListenerInterface } from "@sleepymaid/handler";
import type { GuildMember } from "discord.js";
import sanitize from "@aero/sanitizer";
import { SleepyMaidClient } from "../../lib/extensions/SleepyMaidClient";
import { guildsSettings } from "@sleepymaid/db";
import { eq } from "drizzle-orm";

export default class JoinSanitizerListener implements ListenerInterface {
	public readonly name = "guildMemberUpdate";
	public readonly once = false;

	public async execute(oldMember: GuildMember, newMember: GuildMember, client: SleepyMaidClient) {
		if (newMember.user.bot) return;
		const userRole = newMember.guild.roles.cache.map((role) => role.id);
		const sanitizerSettings = (
			await client.drizzle.select().from(guildsSettings).where(eq(guildsSettings.guildId, newMember.guild.id))
		)[0]!;
		if (!sanitizerSettings) return;
		if (sanitizerSettings.sanitizerEnabled === false) return;
		if (sanitizerSettings.sanitizerIgnoredRoles!.length) {
			if (sanitizerSettings.sanitizerIgnoredRoles!.some((role: string) => userRole.includes(role))) return;
		}
		if (newMember.nickname !== null && oldMember.nickname !== newMember.nickname) {
			const sanitized = sanitize(newMember.nickname);
			if (newMember.nickname !== sanitized) await newMember.setNickname(sanitized, "Sanitizer");
		} else if (oldMember.displayName !== newMember.displayName) {
			const sanitized = sanitize(newMember.displayName);
			if (newMember.displayName !== sanitized) await newMember.setNickname(sanitized, "Sanitizer");
		}
	}
}
