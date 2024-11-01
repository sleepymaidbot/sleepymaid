import sanitize from "@aero/sanitizer";
import { guildsSettings } from "@sleepymaid/db";
import { Listener, type Context } from "@sleepymaid/handler";
import type { GuildMember } from "discord.js";
import { eq } from "drizzle-orm";
import type { SleepyMaidClient } from "@/lib/extensions/SleepyMaidClient";

export default class JoinSanitizerListener extends Listener<"guildMemberAdd", SleepyMaidClient> {
	public constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			name: "guildMemberAdd",
			once: false,
		});
	}

	public override async execute(member: GuildMember) {
		if (member.user.bot) return;
		const client = this.container.client;
		const sanitizerSettings = (
			await client.drizzle.select().from(guildsSettings).where(eq(guildsSettings.guildId, member.guild.id))
		)[0]!;
		if (!sanitizerSettings) return;
		if (sanitizerSettings.sanitizerEnabled === false) return;
		const sanitized = sanitize(member.displayName);
		if (member.displayName !== sanitized) await member.setNickname(sanitized, "Sanitizer");
	}
}
