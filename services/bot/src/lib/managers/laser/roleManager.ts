import 'reflect-metadata'
import {
	ActionRowBuilder,
	APISelectMenuOption,
	ButtonInteraction,
	ButtonStyle,
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
import { singleton } from 'tsyringe'
import { baseManager } from '../BaseManager'

const getEmoji = (roleId: Snowflake, member: GuildMember) => {
	if (member.roles.cache.has(roleId)) return '948620600144982026'
	else return '948606748334358559'
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

const servers = {
	"Murderer's Arena": Server.ma,
	'Doki Doki Murder': Server.doki,
	'Québec Murder': Server.qc
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
		await message.fetch()

		const collector = collectors.get(interaction.user.id)

		if (collectors.get(interaction.user.id)) collector.stop()

		collectors.set(
			interaction.user.id,
			interaction.channel.createMessageComponentCollector({
				message,
				time: 120000
			})
		)

		collectors
			.get(interaction.user.id)
			.on('collect', async (i: ButtonInteraction | SelectMenuInteraction) => {
				if (!i.inCachedGuild()) return
				if (i.member.id !== interaction.member.id) return
				if (message.id !== i.message.id) return
				if (i.isButton()) {
					// Add Navigation Button
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

		collectors.get(interaction.user.id).on('end', () => {
			interaction.editReply({
				content:
					"The menu has expired. You can click 'Dismiss message' to dismiss this message.",
				embeds: [],
				components: []
			})
		})
	}

	private async sendHome(interaction: ButtonInteraction) {
		if (!interaction.isButton()) return
		if (!interaction.inCachedGuild()) return

		await interaction.deferReply({ ephemeral: true })

		const options: Array<APISelectMenuOption> = []
		for await (const [k, v] of Object.entries(servers)) {
			options.push({
				label: k,
				description: `Select this option the manage your role for the ${k}`,
				value: v
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
		const embed = new EmbedBuilder()
			.setTitle('Select a server.')
			.setDescription(
				'Select a server to manage your role. After this you will be able to select the secrets you want to receive ping for.'
			)
		return await interaction.editReply({
			embeds: [embed],
			components: [row]
		})
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
		for (const [k, v] of Object.entries(roles[server])) serverRoles.push(v)

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
				value: 'clue',
				emoji: {
					id: getEmoji(roles[server].clue, interaction.member)
				}
			},
			{
				label: 'Residence',
				description: `Select this option to receive when we are doing the residence secret on the ${server} server.`,
				value: 'residence',
				emoji: {
					id: getEmoji(roles[server].residence, interaction.member)
				}
			},
			{
				label: 'Casino',
				description: `Select this option to receive when we are doing the casino secret on the ${server} server.`,
				value: 'casino',
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

		return {
			components: [row]
		}
	}

	public async removeAllRoles(interaction: ButtonInteraction) {
		if (!interaction.inCachedGuild()) return

		const allRoles: Array<Snowflake> = []

		for (const [k, v] of Object.entries(roles)) {
			for (const r of Object.values(v)) {
				allRoles.push(r)
			}
		}

		await interaction.member.roles.remove(allRoles)
		await interaction.reply({
			content: '<:greenTick:948620600144982026> All roles have been removed.',
			ephemeral: true
		})
	}
}
