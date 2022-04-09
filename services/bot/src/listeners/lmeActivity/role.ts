import { roleSyncer } from '../../lib/rolesyncer'
import 'reflect-metadata'
import { container } from 'tsyringe'
import { BotClient } from '../../lib/BotClient'
import { GuildMember } from 'discord.js'
import { Listener } from '@sleepymaid/handler'

export default new Listener(
	{
		name: 'guildMemberUpdate',
		once: false
	},
	{
		async run(
			client: BotClient,
			oldMember: GuildMember,
			newMember: GuildMember
		) {
			if (newMember.user.bot) return
			container.register(BotClient, { useValue: client })
			await container.resolve(roleSyncer).checkUserRole(newMember)
		}
	}
)
