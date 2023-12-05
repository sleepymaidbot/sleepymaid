import type { ListenerInterface } from '@sleepymaid/handler';
import type { GuildMember } from 'discord.js';
import sanitize from '@aero/sanitizer';
import { SleepyMaidClient } from '../../lib/extensions/SleepyMaidClient';

export default class JoinSanitizerListener implements ListenerInterface {
	public readonly name = 'guildMemberUpdate';
	public readonly once = false;

	public async execute(oldMember: GuildMember, newMember: GuildMember, client: SleepyMaidClient) {
		const userRole = newMember.guild.roles.cache.map((role) => role.id);
		const sanitizerSettings = await client.prisma.sanitizerSettings.findUnique({
			where: { guildId: newMember.guild.id },
		});
		if (!sanitizerSettings) return;
		if (sanitizerSettings.enabled === false) return;
		if (sanitizerSettings.ignoredRoles.length) {
			if (sanitizerSettings.ignoredRoles.some((role: string) => userRole.includes(role))) return;
		}
		if (newMember.nickname !== null && oldMember.nickname !== newMember.nickname) {
			const sanitized = sanitize(newMember.nickname);
			if (newMember.nickname !== sanitized) await newMember.setNickname(sanitized, 'Sanitizer');
		} else if (oldMember.displayName !== newMember.displayName) {
			const sanitized = sanitize(newMember.displayName);
			if (newMember.displayName !== sanitized) await newMember.setNickname(sanitized, 'Sanitizer');
		}
	}
}
