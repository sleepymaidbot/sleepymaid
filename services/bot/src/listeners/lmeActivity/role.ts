import { roleSyncer } from '../../lib/managers/rolesyncer'
import 'reflect-metadata'
import { container } from 'tsyringe'
import { BotClient } from '../../lib/extensions/BotClient'
import { GuildMember } from 'discord.js'
import { Listener } from '@sleepymaid/handler'

export default new Listener(
	{
		name: 'guildMemberUpdate',
		once: false
	},
	{
		async run(
			oldMember: GuildMember,
			newMember: GuildMember,
			client: BotClient
		) {
			if (newMember.user.bot) return
			container.register(BotClient, { useValue: client })
			await container.resolve(roleSyncer).checkUserRole(newMember)
		}
	}
)
