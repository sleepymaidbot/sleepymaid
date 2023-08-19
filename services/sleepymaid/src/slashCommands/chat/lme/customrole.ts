import { SlashCommandBuilder, EmbedBuilder } from '@discordjs/builders';
import { Result } from '@sapphire/result';
import type { SlashCommandInterface } from '@sleepymaid/handler';
import {
	ChatInputApplicationCommandData,
	ChatInputCommandInteraction,
	ColorResolvable,
	GuildMember,
	resolveColor,
} from 'discord.js';
import type { SleepyMaidClient } from '../../../lib/extensions/SleepyMaidClient';

export default class CustomRoleCommand implements SlashCommandInterface {
	public readonly guildIds = ['324284116021542922'];
	public readonly data = new SlashCommandBuilder()
		.setName('customrole')
		.setDescription('Manage your custom role')
		.addSubcommand((subcommand) =>
			subcommand
				.setName('create')
				.setDescription('Create your custom role')
				.addStringOption((option) => option.setName('name').setDescription('The name of your role').setRequired(true))
				.addStringOption((option) =>
					option.setName('color').setDescription('The color of your role').setRequired(false),
				),
		)
		.addSubcommand((subcommand) => subcommand.setName('delete').setDescription('Delete your custom role'))
		.addSubcommand((subcommand) =>
			subcommand
				.setName('name')
				.setDescription('Change your custom role name')
				.addStringOption((option) =>
					option.setName('name').setDescription('The new name of your role').setRequired(true),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('color')
				.setDescription('Change your custom role color')
				.addStringOption((option) =>
					option.setName('color').setDescription('The new color of your role').setRequired(true),
				),
		)
		.toJSON() as ChatInputApplicationCommandData;

	// @ts-ignore
	public async execute(interaction: ChatInputCommandInteraction, client: SleepyMaidClient) {
		if (!interaction.inCachedGuild()) return;
		await interaction.deferReply({ ephemeral: true });
		const subcommand = interaction.options.getSubcommand();
		const inDb = await client.prisma.mondecorte.findUnique({
			where: {
				user_id: interaction.user.id,
			},
		});
		const isEligible = (member: GuildMember, points: Number) => {
			const userrole = member.roles.cache.map((x) => x.id);
			if (userrole.includes('869637334126170112')) return true;
			if (Number(points) >= 250) return true;
			return false;
		};

		const customRoleId = inDb?.custom_role_id;
		const embed = new EmbedBuilder()
			.setAuthor({
				name: `Rôle custom de ${interaction.user.tag}`,
				iconURL: interaction.user.avatarURL() ?? '',
			})
			.setColor(resolveColor('#36393f'))
			.setTimestamp();
		switch (subcommand) {
			case 'create': {
				const name = await interaction.options.getString('name')!;
				const color = (await interaction.options.getString('color')) as ColorResolvable;
				if (isEligible(interaction.member, inDb?.points!)) {
					if (customRoleId !== null || undefined) {
						try {
							const roleReturn = await Result.fromAsync(async () => {
								const role = interaction.guild.roles.cache.find((role) => role.id === customRoleId);
								if (!role) return;
								await interaction.member.roles.add(role);
							});
							if (roleReturn.isErr()) {
								await client.prisma.mondecorte.update({
									where: { user_id: interaction.user.id },
									data: {
										custom_role_id: null,
									},
								});
								embed.setDescription('Ton rôle custom a été supprimé');
								return await interaction.editReply({
									embeds: [embed],
								});
							}
							embed.setDescription('Tu a déja un rôle custom');
							await interaction.editReply({
								embeds: [embed],
							});
						} catch (e) {
							client.logger.error(e as Error);
						}
					} else {
						const sleepyRole = interaction.guild.roles.cache.find((role) => role.id === '811285873458544680');
						if (!sleepyRole) return;
						const checkRole = interaction.guild.roles.fetch(name);
						if (checkRole === undefined) {
							embed.setDescription('Se rôle existe déja.');
							return await interaction.editReply({
								embeds: [embed],
							});
						}
						const pos = sleepyRole.position - 1;
						await interaction.guild.roles
							.create({
								name: name,
								color: resolveColor(color),
								position: pos,
								reason: `Custom role created by ${interaction.member.user.tag} (${interaction.member.id})`,
							})
							.then(async (role) => {
								interaction.member.roles.add(role);
								await client.prisma.mondecorte
									.update({
										data: {
											custom_role_id: role.id,
										},
										where: {
											user_id: interaction.member.id,
										},
									})
									.then(async () => {
										embed.setDescription(`Ton rôle custom a été créer <@&${role.id}>.
									Pour modifier le nom fait la commande  \`\`/customrole name <name>\`\`
									Pour modifier la couleur fait la commande \`\`/customrole color <color>\`\``);
										await interaction.editReply({
											embeds: [embed],
										});
									});
							})
							.catch(client.logger.error);
					}
				} else {
					embed.setDescription("Tu n'est pas éligible.");
					await interaction.editReply({ embeds: [embed] });
				}
				break;
			}
			case 'delete': {
				if (customRoleId) {
					try {
						const crole = interaction.guild.roles.cache.find((role) => role.id === customRoleId);
						if (!crole) return;
						await crole.delete();
						await client.prisma.mondecorte
							.update({
								data: {
									custom_role_id: null,
								},
								where: {
									user_id: interaction.member.id,
								},
							})
							.then(async () => {
								embed.setDescription('Ton rôle custom a été supprimer');
								await interaction.editReply({
									embeds: [embed],
								});
							});
					} catch (e) {
						client.logger.error(e as Error);
					}
				} else {
					embed.setDescription("Tu n'as pas de rôle custom");
					await interaction.editReply({ embeds: [embed] });
				}
				break;
			}
			case 'name': {
				const name = interaction.options.getString('name')!;
				if (customRoleId && isEligible(interaction.member, inDb?.points!)) {
					const crole = interaction.guild.roles.cache.find((role) => role.id === customRoleId);
					if (!crole) return;
					crole
						.setName(name)
						.then(async (updated) => {
							embed.setDescription(`Le nom de ton rôle custom a été changer pour #${name} (<@&${updated.id}>)`);
							await interaction.editReply({
								embeds: [embed],
							});
						})
						.catch(client.logger.error);
				} else {
					embed.setDescription("Tu n'as pas de rôle custom");
					await interaction.editReply({ embeds: [embed] });
				}
				break;
			}
			case 'color': {
				const color = interaction.options.getString('color')! as ColorResolvable;
				if (customRoleId && isEligible(interaction.member, inDb?.points!)) {
					const crole = interaction.guild.roles.cache.find((role) => role.id === customRoleId);
					if (!crole) return;
					crole
						.setColor(resolveColor(color))
						.then(async (updated) => {
							embed.setDescription(`La couleur de ton rôle custom a été changer pour #${color} (<@&${updated.id}>)`);
							await interaction.editReply({
								embeds: [embed],
							});
						})
						.catch(client.logger.error);
				} else {
					embed.setDescription("Tu n'as pas de rôle custom");
					await interaction.editReply({ embeds: [embed] });
				}
				break;
			}
		}
	}
}
