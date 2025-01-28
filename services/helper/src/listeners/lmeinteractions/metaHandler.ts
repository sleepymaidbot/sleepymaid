import { ButtonBuilder, ActionRowBuilder, SelectMenuBuilder, SelectMenuOptionBuilder } from "@discordjs/builders";
import type { Context } from "@sleepymaid/handler";
import { Listener } from "@sleepymaid/handler";
import { pingRoleIds, colorRoleIds } from "@sleepymaid/shared";
import { MessageFlags, type ButtonInteraction, type SelectMenuInteraction } from "discord.js";
import type { HelperClient } from "../../lib/extensions/HelperClient";

export default class MetahandlerListener extends Listener<"interactionCreate", HelperClient> {
	public constructor(context: Context<HelperClient>) {
		super(context, {
			name: "interactionCreate",
			once: false,
		});
	}

	public override async execute(interaction: ButtonInteraction | SelectMenuInteraction) {
		if (!interaction.customId?.startsWith("lmeMeta")) return;
		if (!interaction.inCachedGuild()) return;
		const Ids = interaction.customId.split(":");
		if (Ids[0] !== "lmeMeta") return;
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });
		if (Ids[1] === "bienvenue") {
			if (Ids[2] === "init") {
				switch (Ids[3]) {
					case "ping": {
						const pingOptions = [
							{
								label: "Annonce",
								description: "Notification pour les annonces importantes",
								emoji: { name: "📢" },
								value: "879465272669528098",
							},
							{
								label: "Free Stuff",
								description: "Notification pour quand un jeux deviens gratuit",
								emoji: { name: "🎮" },
								value: "879465303795466240",
							},
							{
								label: "Giveaway",
								description: "Notification pour quand il y a un giveaway",
								emoji: { name: "🎉" },
								value: "879465436922642462",
							},
						];
						const row1 = new ActionRowBuilder<SelectMenuBuilder>().addComponents([
							new SelectMenuBuilder()
								.setCustomId("lmeMeta:bienvenue:select:ping")
								.setPlaceholder("Choisis ici tes rôles de notification")
								.setMaxValues(3)
								.setMinValues(0)
								.addOptions(pingOptions.map((option) => new SelectMenuOptionBuilder(option))),
						]);

						const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents([
							new ButtonBuilder()
								.setLabel("Supprimer mes notifications")
								.setCustomId("lmeMeta:bienvenue:delete:ping")
								.setEmoji({ id: "948606748334358559" })
								.setStyle(2),
						]);

						return interaction.editReply({
							content: "Sélectionnez ci-dessous les notifications que vous souhaitez recevoir.",
							components: [row1, row2],
						});
					}

					case "color": {
						return interaction.editReply({
							content: "Le rôle n'est plus disponible.",
						});
					}

					case "viewRoles": {
						const pingRole = interaction.member.roles.cache.filter((role) => pingRoleIds.includes(role.id));
						// const colorRole = interaction.member.roles.cache.filter((role) => colorRoleIds.includes(role.id));
						let cleanPingRole;
						if (pingRole.size > 0) {
							cleanPingRole = "**Notifications:**" + pingRole.map((role) => "<@&" + role.id + ">").join(", ");
						} else {
							cleanPingRole = "**Notifications:** Aucune";
						}

						/* let cleanColorRole;
						if (colorRole.size > 0) {
							cleanColorRole = '**Couleurs:**' + colorRole.map((role) => '<@&' + role.id + '>').join(', ');
						} else {
							cleanColorRole = '**Couleurs:** Aucune';
						}*/

						return interaction.editReply({
							content: cleanPingRole /* + '\n' + cleanColorRole*/,
						});
					}

					default: {
						return interaction.editReply({
							content: "Erreur",
						});
					}
				}
			} else if (Ids[2] === "select") {
				switch (Ids[3]) {
					case "ping": {
						const currentPingRole = interaction.member.roles.cache
							.filter((role) => pingRoleIds.includes(role.id))
							.map((role) => role.id);

						if (!interaction.isStringSelectMenu()) return;
						const newPingRole = interaction.values;

						const toAdd = newPingRole.filter((role) => !currentPingRole.includes(role));
						const toRemove = currentPingRole.filter((role) => !newPingRole.includes(role));

						await interaction.member.roles.add(toAdd);
						await interaction.member.roles.remove(toRemove);

						return interaction.editReply({
							content: "<:greenTick:948620600144982026> Tes rôles de notifications ont été mis à jour.",
						});
					}

					case "color": {
						return interaction.editReply({
							content: "Le rôle n'est plus disponible.",
						});
					}

					default: {
						return interaction.editReply({
							content: "Erreur",
						});
					}
				}
			} else if (Ids[2] === "delete") {
				switch (Ids[3]) {
					case "ping": {
						const currentPingRole = interaction.member.roles.cache
							.filter((role) => pingRoleIds.includes(role.id))
							.map((role) => role.id);
						await interaction.member.roles.remove(currentPingRole);
						return interaction.editReply({
							content: "<:greenTick:948620600144982026> L'ensemble de tes rôles de notifications ont bien été retirés.",
						});
					}

					case "color": {
						const currentColorRole = interaction.member.roles.cache
							.filter((role) => colorRoleIds.includes(role.id))
							.map((role) => role.id);
						await interaction.member.roles.remove(currentColorRole);
						return interaction.editReply({
							content: "<:greenTick:948620600144982026> Ton rôle de couleur à bien été retiré.",
						});
					}

					default: {
						return interaction.editReply({
							content: "Erreur",
						});
					}
				}
			} else if (Ids[2] === "join") {
				if (
					interaction.member.roles.cache.has("884149070757769227") ||
					interaction.member.roles.cache.has("862462288345694210") ||
					interaction.member.roles.cache.has("403681300940193804")
				)
					return interaction.editReply({
						content: "Tu es déjà membre.",
					});
				else {
					return interaction.editReply({
						content: "Le rôle n'est plus disponible.",
					});
					/* const role = await interaction.guild.roles.cache.find((r) => r.id === '884149070757769227');
					if (!role) return;
					await interaction.member.roles.add(role);

					await interaction.editReply({
						content: `<:wave:948626464432083014> **__Bienvenue sur le serveur__**`,
					});*/
				}
			} else {
				return interaction.editReply({
					content: "Erreur",
				});
			}
		} else {
			return interaction.editReply({
				content: "Erreur",
			});
		}
	}
}
