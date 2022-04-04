import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'

module.exports = {
	data: new SlashCommandBuilder()
		.setName('config')
		.setDescription('Summon a menu to configure the bot')
		.addSubcommandGroup((SubCommandGroup) =>
			SubCommandGroup.setName('admin-role')
				.setDescription('Configure the admin role')
				.addSubcommand((subcommand) =>
					subcommand
						.setName('add')
						.setDescription('Add a role to the admin role list.')
						.addRoleOption((roleOption) =>
							roleOption
								.setName('role')
								.setDescription('The role to add to the admin role list.')
								.setRequired(true)
						)
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('remove')
						.setDescription('Remove a role from the admin role list.')
						.addRoleOption((roleOption) =>
							roleOption
								.setName('role')
								.setDescription('The role to remove from the admin role list.')
								.setRequired(true)
						)
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('list')
						.setDescription('List all roles in the admin role list.')
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('clear')
						.setDescription('Clear the admin role list.')
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('remove-deleted')
						.setDescription('Remove all roles that have been deleted.')
				)
		)
		.addSubcommandGroup((SubCommandGroup) =>
			SubCommandGroup.setName('mod-role')
				.setDescription('Configure the mod role')
				.addSubcommand((subcommand) =>
					subcommand
						.setName('add')
						.setDescription('Add a role to the mod role list.')
						.addRoleOption((roleOption) =>
							roleOption
								.setName('role')
								.setDescription('The role to add to the mod role list.')
								.setRequired(true)
						)
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('remove')
						.setDescription('Remove a role from the mod role list.')
						.addRoleOption((roleOption) =>
							roleOption
								.setName('role')
								.setDescription('The role to remove from the mod role list.')
								.setRequired(true)
						)
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('list')
						.setDescription('List all roles in the mod role list.')
				)
				.addSubcommand((subcommand) =>
					subcommand.setName('clear').setDescription('Clear the mod role list.')
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('remove-deleted')
						.setDescription('Remove all roles that have been deleted.')
				)
		)

		.toJSON(),

	async execute(interaction: CommandInteraction) {
		await interaction.reply('This command is not implemented yet.')
	}
}
