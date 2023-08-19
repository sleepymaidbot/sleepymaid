import 'reflect-metadata';
import { SleepyMaidClient } from '../../lib/extensions/SleepyMaidClient';
import { voiceXpManager } from '../../lib/managers/lme/voiceXpManager';
import { container } from 'tsyringe';
import { pointsBlacklistedVoiceChannel } from '@sleepymaid/shared';
import type { VoiceState } from 'discord.js';
import type { ListenerInterface } from '@sleepymaid/handler';

enum VoiceXpState {
	None,
	Start,
	Stop,
}

export default class VoiceListener implements ListenerInterface {
	public readonly name = 'voiceStateUpdate';
	public readonly once = false;

	public async execute(oldState: VoiceState, newState: VoiceState, client: SleepyMaidClient) {
		if (oldState.guild.id !== '324284116021542922') return;
		if (!oldState.member || !newState.member) return;
		if (oldState?.member?.user.bot) return;
		let status = VoiceXpState.None;
		// Someone join vc start timer
		if (oldState.channel?.id === undefined && newState.channel?.id !== undefined && !newState.deaf && !newState.mute) {
			if (pointsBlacklistedVoiceChannel.includes(newState.channel.id)) return;
			status = VoiceXpState.Start;
		}
		// Someone leave vc stop timer
		if (oldState.channel?.id !== undefined && newState.channel?.id === undefined) status = VoiceXpState.Stop;
		// Someone change channel from bl to non-bl
		if (
			oldState.channel?.id !== undefined &&
			pointsBlacklistedVoiceChannel.includes(oldState.channel?.id) &&
			newState.channel?.id !== undefined &&
			!pointsBlacklistedVoiceChannel.includes(newState.channel?.id) &&
			!newState.deaf &&
			!newState.mute
		)
			status = VoiceXpState.Start;
		// Someone change channel from non-bl to bl
		if (
			oldState.channel?.id !== undefined &&
			!pointsBlacklistedVoiceChannel.includes(oldState.channel?.id) &&
			newState.channel?.id !== undefined &&
			pointsBlacklistedVoiceChannel.includes(newState.channel?.id)
		)
			status = VoiceXpState.Stop;
		// Someone mutes themselves
		if (
			oldState.channel?.id !== undefined &&
			newState.channel?.id !== undefined &&
			oldState.channel?.id === newState.channel?.id &&
			!oldState.mute &&
			newState.mute
		)
			status = VoiceXpState.Stop;
		// Someone unmutes themselves
		if (
			oldState.channel?.id !== undefined &&
			newState.channel?.id !== undefined &&
			oldState.channel?.id === newState.channel?.id &&
			oldState.mute &&
			!newState.mute
		) {
			if (pointsBlacklistedVoiceChannel.includes(newState.channel.id)) return;
			status = VoiceXpState.Start;
		}
		// Someone deafen themselves
		if (
			oldState.channel?.id !== undefined &&
			newState.channel?.id !== undefined &&
			oldState.channel?.id === newState.channel?.id &&
			!oldState.deaf &&
			newState.deaf
		)
			status = VoiceXpState.Stop;
		// Someone undeafen themselves
		if (
			oldState.channel?.id !== undefined &&
			newState.channel?.id !== undefined &&
			oldState.channel?.id === newState.channel?.id &&
			oldState.deaf &&
			!newState.deaf
		) {
			if (pointsBlacklistedVoiceChannel.includes(newState.channel.id)) return;
			status = VoiceXpState.Start;
		}

		switch (status) {
			default:
			case VoiceXpState.None:
				break;
			case VoiceXpState.Start:
				container.register(SleepyMaidClient, { useValue: client });
				container.resolve(voiceXpManager).start(newState.member);
				break;
			case VoiceXpState.Stop:
				container.register(SleepyMaidClient, { useValue: client });
				container.resolve(voiceXpManager).stop(newState.member);
				break;
		}
	}
}
