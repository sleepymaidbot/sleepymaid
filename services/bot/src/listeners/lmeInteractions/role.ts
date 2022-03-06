import { roleSyncer } from '../../lib/rolesyncer'
import 'reflect-metadata'
import { container } from 'tsyringe'
import { BotClient } from '../../lib/BotClient'

module.exports = {
	name: 'guildMemberUpdate',
	once: false,

	async execute(oldMember, newMember, client: BotClient) {
		container.register(BotClient, { useValue: client })
		await container.resolve(roleSyncer).checkUserRole(newMember)
	}
}
