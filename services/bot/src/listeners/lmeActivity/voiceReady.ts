import 'reflect-metadata'
import { ChannelType, GuildMember } from 'discord.js'
import { pointsBlacklistedVoiceChannel } from '../../lib/lists'
import { container } from 'tsyringe'
import { BotClient } from '../../lib/extensions/BotClient'
import { voiceXpManager } from '../../lib/managers/voiceXpManager'
import { Listener } from '@sleepymaid/handler'

export default new Listener(
	{
		name: 'ready',
		once: true
	},
	{
		async run(client: BotClient) {
			const guild = await client.guilds.cache.get('324284116021542922')
			await guild.channels.cache.forEach(async (channel) => {
				if (channel.type == ChannelType.GuildVoice) {
					if (pointsBlacklistedVoiceChannel.includes(channel.id)) return
					channel.members.each(async (member: GuildMember) => {
						if (member.user.bot) return
						if (member.voice.mute || member.voice.deaf) return
						container.register(BotClient, { useValue: client })
						container.resolve(voiceXpManager).start(member)
					})
				}
			})
		}
	}
)
