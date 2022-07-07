import { roleSyncer } from '../../lib/managers/lme/rolesyncer'
import 'reflect-metadata'
import { container } from 'tsyringe'
import { BotClient } from '../../lib/extensions/BotClient'
import { GuildMember } from 'discord.js'
import { ListenerInterface } from '@sleepymaid/handler'

export default class RoleListener implements ListenerInterface {
	public readonly name = 'guildMemberUpdate'
	public readonly once = false

	public async execute(
		oldMember: GuildMember,
		newMember: GuildMember,
		client: BotClient
	) {
		if (newMember.user.bot) return
		if (newMember.guild.id !== '324284116021542922') return
		container.register(BotClient, { useValue: client })
		await container.resolve(roleSyncer).checkUserRole(newMember)
	}
}
