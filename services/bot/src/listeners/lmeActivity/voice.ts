import 'reflect-metadata'
import { BotClient } from '../../lib/BotClient'
import { voiceXpManager } from '../../lib/managers/voiceXpManager'
import { container } from 'tsyringe'
import { pointsBlacklistedVoiceChannel } from '../../lib/lists'
import { VoiceState } from 'discord.js'
import { Listener } from '@sleepymaid/handler'

enum VoiceXpState {
	None,
	Start,
	Stop
}

export default new Listener(
	{
		name: 'voiceStateUpdate',
		once: false
	},
	{
		async run(oldState: VoiceState, newState: VoiceState, client: BotClient) {
			if (oldState.member.user.bot) return
			let status = VoiceXpState.None
			// Someone join vc start timer
			if (
				oldState.channel === null &&
				newState.channel !== null &&
				!pointsBlacklistedVoiceChannel.includes(newState.channel.id) &&
				!newState.deaf &&
				!newState.mute
			)
				status = VoiceXpState.Start
			// Someone leave vc stop timer
			if (oldState.channel !== null && newState.channel === null)
				status = VoiceXpState.Stop
			// Someone change channel from bl to non-bl
			if (
				oldState.channel !== null &&
				pointsBlacklistedVoiceChannel.includes(oldState.channel.id) &&
				newState.channel !== null &&
				!pointsBlacklistedVoiceChannel.includes(newState.channel.id) &&
				!newState.deaf &&
				!newState.mute
			)
				status = VoiceXpState.Start
			// Someone change channel from non-bl to bl
			if (
				oldState.channel !== null &&
				!pointsBlacklistedVoiceChannel.includes(oldState.channel.id) &&
				newState.channel !== null &&
				pointsBlacklistedVoiceChannel.includes(newState.channel.id)
			)
				status = VoiceXpState.Stop
			// Someone mutes themselves
			if (
				oldState.channel !== null &&
				newState.channel !== null &&
				oldState.channel.id === newState.channel.id &&
				!oldState.mute &&
				newState.mute
			)
				status = VoiceXpState.Stop
			// Someone unmutes themselves
			if (
				oldState.channel !== null &&
				newState.channel !== null &&
				oldState.channel.id === newState.channel.id &&
				oldState.mute &&
				!newState.mute
			)
				status = VoiceXpState.Start
			// Someone deafen themselves
			if (
				oldState.channel !== null &&
				newState.channel !== null &&
				oldState.channel.id === newState.channel.id &&
				!oldState.deaf &&
				newState.deaf
			)
				status = VoiceXpState.Stop
			// Someone undeafen themselves
			if (
				oldState.channel !== null &&
				newState.channel !== null &&
				oldState.channel.id === newState.channel.id &&
				oldState.deaf &&
				!newState.deaf
			)
				status = VoiceXpState.Start

			switch (status) {
				case VoiceXpState.None:
					break
				case VoiceXpState.Start:
					container.register(BotClient, { useValue: client })
					container.resolve(voiceXpManager).start(newState.member)
					break
				case VoiceXpState.Stop:
					container.register(BotClient, { useValue: client })
					container.resolve(voiceXpManager).stop(newState.member)
					break
			}
		}
	}
)
