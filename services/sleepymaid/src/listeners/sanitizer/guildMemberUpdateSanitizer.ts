import sanitize from "@aero/sanitizer"
import { guildSettings } from "@sleepymaid/db"
import type { Context } from "@sleepymaid/handler"
import { Listener } from "@sleepymaid/handler"
import type { GuildMember } from "discord.js"
import { eq } from "drizzle-orm"
import type { SleepyMaidClient } from "../../lib/SleepyMaidClient"

export default class JoinSanitizerListener extends Listener<"guildMemberUpdate", SleepyMaidClient> {
	public constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			name: "guildMemberUpdate",
			once: false,
		})
	}

	public override async execute(oldMember: GuildMember, newMember: GuildMember) {
		if (newMember.user.bot) return
		const client = this.container.client
		const userRole = newMember.guild.roles.cache.map((role) => role.id)
		const guildSetting = await client.drizzle.query.guildSettings.findFirst({
			where: eq(guildSettings.guildId, newMember.guild.id),
		})
		if (!guildSetting) return
		if (guildSetting.sanitizerEnabled === false) return
		if (
			guildSetting.sanitizerIgnoredRoles.length &&
			guildSetting.sanitizerIgnoredRoles.some((role: string) => userRole.includes(role))
		)
			return
		if (newMember.nickname !== null && oldMember.nickname !== newMember.nickname) {
			const sanitized = sanitize(newMember.nickname)
			if (newMember.nickname !== sanitized) await newMember.setNickname(sanitized, "Sanitizer")
		} else if (oldMember.displayName !== newMember.displayName) {
			const sanitized = sanitize(newMember.displayName)
			if (newMember.displayName !== sanitized) await newMember.setNickname(sanitized, "Sanitizer")
		}
	}
}
