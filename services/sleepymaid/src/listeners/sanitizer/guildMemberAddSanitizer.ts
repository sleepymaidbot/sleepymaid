import type { ListenerInterface } from '@sleepymaid/handler';
import type { GuildMember } from 'discord.js';
import sanitize from '@aero/sanitizer';
import { SleepyMaidClient } from '../../lib/extensions/SleepyMaidClient';
import { guildsSettings } from '@sleepymaid/db';
import { eq } from 'drizzle-orm';

export default class JoinSanitizerListener implements ListenerInterface {
	public readonly name = 'guildMemberAdd';
	public readonly once = false;

	public async execute(member: GuildMember, client: SleepyMaidClient) {
		if (member.user.bot) return;
		const sanitizerSettings = (
			await client.drizzle.select().from(guildsSettings).where(eq(guildsSettings.guildId, member.guild.id))
		)[0]!;
		if (!sanitizerSettings) return;
		if (sanitizerSettings.sanitizerEnabled === false) return;
		const sanitized = sanitize(member.displayName);
		if (member.displayName !== sanitized) await member.setNickname(sanitized, 'Sanitizer');
	}
}
