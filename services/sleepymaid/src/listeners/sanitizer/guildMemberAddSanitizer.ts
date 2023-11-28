import type { ListenerInterface } from '@sleepymaid/handler';
import type { GuildMember } from 'discord.js';
import sanitize from '@aero/sanitizer';

export default class JoinSanitizerListener implements ListenerInterface {
	public readonly name = 'guildMemberAdd';
	public readonly once = false;

	public async execute(member: GuildMember) {
		const sanitized = sanitize(member.displayName);
		if (member.displayName !== sanitized) await member.setNickname(sanitized, 'Sanitizer');
	}
}
