import sanitize from "@aero/sanitizer"
import { guildSettings } from "@sleepymaid/db"
import { type Context, Listener } from "@sleepymaid/handler"
import type { GuildMember } from "discord.js"
import { eq } from "drizzle-orm"
import type { SleepyMaidClient } from "../../lib/SleepyMaidClient"

export default class JoinSanitizerListener extends Listener<"guildMemberAdd", SleepyMaidClient> {
	public constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			name: "guildMemberAdd",
			once: false,
		})
	}

	public override async execute(member: GuildMember) {
		if (member.user.bot) return
		const client = this.container.client
		const guildSetting = await client.drizzle.query.guildSettings.findFirst({
			where: eq(guildSettings.guildId, member.guild.id),
		})
		if (!guildSetting) return
		if (guildSetting.sanitizerEnabled === false) return
		const sanitized = sanitize(member.displayName)
		if (member.displayName !== sanitized) await member.setNickname(sanitized, "Sanitizer")
	}
}
