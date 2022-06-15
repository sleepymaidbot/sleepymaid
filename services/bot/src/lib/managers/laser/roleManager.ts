import 'reflect-metadata'
import {
	ActionRowBuilder,
	ButtonInteraction,
	CacheType,
	Collection,
	EmbedBuilder,
	GuildMember,
	Interaction,
	InteractionCollector,
	MessageComponentInteraction,
	SelectMenuInteraction,
	SelectMenuOptionBuilder,
	Snowflake,
	UnsafeButtonBuilder,
	UnsafeSelectMenuBuilder
} from 'discord.js'
import { APISelectMenuOption, ButtonStyle } from 'discord-api-types/v10'
import { singleton } from 'tsyringe'
import { baseManager } from '../BaseManager'

const getEmoji = (roleId: Snowflake, member: GuildMember) => {
	if (member.roles.cache.has(roleId)) return '948620600144982026'
	else return '948606748334358559'
}

const getDefault = (roleId: Snowflake, member: GuildMember) => {
	if (member.roles.cache.has(roleId)) return true
	else return false
}

enum Server {
	ma = 'ma',
	doki = 'doki',
	qc = 'qc'
}

enum Secret {
	clue = 'clue',
	residence = 'residence',
	casino = 'casino'
}

enum EndReason {
	overlap = 'overlap',
	cancel = 'cancel'
}

const roles = {
	ma: {
		clue: '975914678217764934',
		residence: '975914762665881670',
		casino: '975914782131617813'
	},
	doki: {
		clue: '975914803270926336',
		residence: '975914839518097468',
		casino: '975914869096329246'
	},
	qc: {
		clue: '975914893540724757',
		residence: '975914942727340032',
		casino: '975914964474798091'
	}
}

const collectors: Collection<
	Snowflake,
	InteractionCollector<MessageComponentInteraction<CacheType>>
> = new Collection()

@singleton()
export class laserRoleManager extends baseManager {
	public async startMenu(interaction: ButtonInteraction) {
		if (!interaction.inCachedGuild()) return
		await interaction.member.fetch()
		const message = await this.sendHome(interaction)

		const collector = collectors.get(interaction.user.id)

		if (collectors.get(interaction.user.id)) collector.stop(EndReason.overlap)

		collectors.set(
			interaction.user.id,
			interaction.channel.createMessageComponentCollector({
				message,
				filter: (i: Interaction) => {
					if (!i.inCachedGuild()) return false
					if (i.user.id === interaction.user.id) return true
				},
				time: 120000
			})
		)

		collectors
			.get(interaction.user.id)
			.on('collect', async (i: ButtonInteraction | SelectMenuInteraction) => {
				if (!i.inCachedGuild()) return
				if (message.id !== i.message.id) return
				if (i.isButton()) {
					const page = i.customId.split(':')[1]
					let server: Server
					switch (page) {
						case 'backhome':
							await this.backHome(i as ButtonInteraction)
							break
						case 'close':
							collectors.get(interaction.user.id).stop(EndReason.cancel)
							break
						case 'remove':
							server = i.customId.split(':')[2] as Server
							await this.removeRoles(i as ButtonInteraction, server)
					}
				} else if (i.isSelectMenu()) {
					const page = i.customId.split(':')[1]
					switch (page) {
						case 'home': // Received in the server selection
							await this.selectServer(i as SelectMenuInteraction)
							break
						case 'secret': // Received in the secret selection
							await this.selectSecret(i as SelectMenuInteraction)
							break
					}
				}
			})

		collectors.get(interaction.user.id).on('end', (_, reason: EndReason) => {
			if (reason === EndReason.overlap) {
				interaction.editReply({
					content:
						"You have a new menu open. To save performance, only one menu can be open at a time. You can click 'Dismiss message' to dismiss this message.",
					embeds: [],
					components: []
				})
			} else if (reason === EndReason.cancel) {
				interaction.editReply({
					content:
						"You have closed this menu. You can click 'Dismiss message' to dismiss this message.",
					embeds: [],
					components: []
				})
			} else {
				interaction.editReply({
					content:
						"The menu has expired. You can click 'Dismiss message' to dismiss this message.",
					embeds: [],
					components: []
				})
			}
		})
	}

	private async sendHome(interaction: ButtonInteraction) {
		if (!interaction.isButton()) return
		if (!interaction.inCachedGuild()) return

		await interaction.deferReply({ ephemeral: true })

		return await interaction.editReply({
			...this.generateHomeMessage()
		})
	}

	private async backHome(interaction: ButtonInteraction) {
		return await interaction.update({
			...this.generateHomeMessage()
		})
	}

	private generateHomeMessage() {
		const cleanName = {
			ma: "Murderer's Arena",
			doki: 'Doki Doki Murder',
			qc: 'Québec Murder'
		}
		const options: Array<APISelectMenuOption> = []
		for (const [k, v] of Object.entries(cleanName)) {
			options.push({
				label: v,
				description: `Select this option the manage your role for the ${v} server`,
				value: k
			})
		}

		const row = new ActionRowBuilder<UnsafeSelectMenuBuilder>().addComponents(
			new UnsafeSelectMenuBuilder()
				.setCustomId('laser-role-ping:home')
				.setMaxValues(1)
				.setMinValues(1)
				.setPlaceholder('Select a server.')
				.addOptions(
					...options.map((options) => new SelectMenuOptionBuilder(options))
				)
		)

		const buttonRow = new ActionRowBuilder<UnsafeButtonBuilder>().addComponents(
			new UnsafeButtonBuilder()
				.setLabel('Close this menu')
				.setCustomId('laser-role-ping:close')
				.setStyle(ButtonStyle.Danger)
				.setEmoji({ id: '977037861205459014' })
		)

		const embed = new EmbedBuilder()
			.setTitle('Select a server.')
			.setDescription(
				'Select a server to manage your role. After this you will be able to select the secrets you want to receive ping for.'
			)

		return {
			embeds: [embed],
			components: [row, buttonRow]
		}
	}

	private async selectServer(interaction: SelectMenuInteraction) {
		if (!interaction.inCachedGuild()) return
		const server: Server = interaction.values[0] as Server
		await interaction.deferUpdate()

		const embed = new EmbedBuilder()
			.setTitle(`Select the secrets you want to receive ping for.`)
			.setDescription(
				`Select the secrets you want to receive ping for. The roles you already have will have a <:greenTick:948620600144982026> emoji. The roles you don't have will have a <:redX:948606748334358559> emoji.`
			)

		await interaction.editReply({
			embeds: [embed],
			...this.generateSecretMessage(interaction, server)
		})
	}

	private async selectSecret(interaction: SelectMenuInteraction) {
		if (!interaction.inCachedGuild()) return
		if (!interaction.inCachedGuild()) return
		const server: Server = interaction.customId.split(':')[2] as Server

		const selectedRoles = []

		for (const secret of interaction.values) {
			selectedRoles.push(roles[server][secret])
		}

		const serverRoles = []
		for (const v of Object.values(roles[server])) serverRoles.push(v)

		const userRole = interaction.member.roles.cache
			.map((r) => r.id)
			.filter((r) => serverRoles.includes(r))

		const toAdd = selectedRoles.filter((r) => !userRole.includes(r))
		const toRemove = serverRoles.filter((r) => !selectedRoles.includes(r))

		if (toRemove.length >= 1) await interaction.member.roles.remove(toRemove)
		if (toAdd.length >= 1) await interaction.member.roles.add(toAdd)

		await interaction.update({
			...this.generateSecretMessage(interaction, server)
		})
	}

	private generateSecretMessage(interaction: Interaction, server: Server) {
		if (!interaction.inCachedGuild()) return
		const options: Array<APISelectMenuOption> = [
			{
				label: 'Clue',
				description: `Select this option to receive when we are doing the clue secret on the ${server} server.`,
				value: Secret.clue,
				default: getDefault(roles[server].clue, interaction.member),
				emoji: {
					id: getEmoji(roles[server].clue, interaction.member)
				}
			},
			{
				label: 'Residence',
				description: `Select this option to receive when we are doing the residence secret on the ${server} server.`,
				value: Secret.residence,
				default: getDefault(roles[server].residence, interaction.member),
				emoji: {
					id: getEmoji(roles[server].residence, interaction.member)
				}
			},
			{
				label: 'Casino',
				description: `Select this option to receive when we are doing the casino secret on the ${server} server.`,
				value: Secret.casino,
				default: getDefault(roles[server].casino, interaction.member),
				emoji: {
					id: getEmoji(roles[server].casino, interaction.member)
				}
			}
		]

		const row = new ActionRowBuilder<UnsafeSelectMenuBuilder>().addComponents(
			new UnsafeSelectMenuBuilder()
				.setCustomId('laser-role-ping:secret:' + server)
				.setMaxValues(3)
				.setMinValues(1)
				.setPlaceholder('Select the secrets you want to receive ping for.')
				.addOptions(
					...options.map((options) => new SelectMenuOptionBuilder(options))
				)
		)
		const removeRow = new ActionRowBuilder<UnsafeButtonBuilder>().addComponents(
			new UnsafeButtonBuilder()
				.setLabel('Remove all roles from this server')
				.setCustomId('laser-role-ping:remove:' + server)
				.setEmoji({ id: '948606748334358559' })
				.setStyle(ButtonStyle.Danger)
		)

		const buttonRow = new ActionRowBuilder<UnsafeButtonBuilder>().addComponents(
			new UnsafeButtonBuilder()
				.setLabel('Go Back')
				.setCustomId('laser-role-ping:backhome')
				.setStyle(ButtonStyle.Secondary)
				.setEmoji({ id: '977037927953612871' }),
			new UnsafeButtonBuilder()
				.setLabel('Close this menu')
				.setCustomId('laser-role-ping:close')
				.setStyle(ButtonStyle.Danger)
				.setEmoji({ id: '977037861205459014' })
		)

		return {
			components: [row, removeRow, buttonRow]
		}
	}

	public async removeRoles(interaction: ButtonInteraction, server?: Server) {
		if (!interaction.inCachedGuild()) return

		const allRoles: Array<Snowflake> = []

		if (!server)
			for (const v of Object.values(roles)) {
				for (const r of Object.values(v)) {
					allRoles.push(r)
				}
			}
		else
			for (const r of Object.values(roles[server])) {
				allRoles.push(r)
			}

		await interaction.member.roles.remove(allRoles)
		if (server)
			await interaction.update({
				...this.generateSecretMessage(interaction, server)
			})
		else
			await interaction.reply({
				content: '<:greenTick:948620600144982026> All roles have been removed.',
				ephemeral: true
			})
	}
}
