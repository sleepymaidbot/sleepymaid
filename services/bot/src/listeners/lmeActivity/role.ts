import { roleSyncer } from '../../lib/rolesyncer'
import 'reflect-metadata'
import { container } from 'tsyringe'
import { BotClient } from '../../lib/BotClient'
import { GuildMember } from 'discord.js'

module.exports = {
	name: 'guildMemberUpdate',
	once: false,

	async execute(
		oldMember: GuildMember,
		newMember: GuildMember,
		client: BotClient
	) {
		if (newMember.user.bot) return
		container.register(BotClient, { useValue: client })
		await container.resolve(roleSyncer).checkUserRole(newMember)
	}
}
