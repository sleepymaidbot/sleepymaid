import type { ListenerInterface } from '@sleepymaid/handler';
import type { GuildMember } from 'discord.js';

export default class WelcomeListener implements ListenerInterface {
	public readonly name = 'guildMemberAdd';
	public readonly once = false;

	public async execute(member: GuildMember) {
		if (member.guild.id !== '1131653884377579651') return;
		const role = member.guild.roles.cache.get('1131656791118336071');
		if (!role) return;
		await member.roles.add(role);
	}
}
