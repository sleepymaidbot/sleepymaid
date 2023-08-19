import 'reflect-metadata';
import { ChannelType, GuildMember } from 'discord.js';
import { pointsBlacklistedVoiceChannel } from '@sleepymaid/shared';
import { container } from 'tsyringe';
import { SleepyMaidClient } from '../../lib/extensions/SleepyMaidClient';
import { voiceXpManager } from '../../lib/managers/lme/voiceXpManager';
import type { ListenerInterface } from '@sleepymaid/handler';

export default class VoiceReadyListener implements ListenerInterface {
	public readonly name = 'ready';
	public readonly once = true;

	public async execute(client: SleepyMaidClient) {
		const guild = client.guilds.cache.get('324284116021542922');
		if (!guild) return;
		guild.channels.cache.forEach(async (channel) => {
			if (channel.type == ChannelType.GuildVoice) {
				if (pointsBlacklistedVoiceChannel.includes(channel.id)) return;
				channel.members.each(async (member: GuildMember) => {
					if (member.user.bot) return;
					if (member.voice.mute || member.voice.deaf) return;
					container.register(SleepyMaidClient, { useValue: client });
					container.resolve(voiceXpManager).start(member);
				});
			}
		});
	}
}
