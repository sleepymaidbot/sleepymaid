import { Context, SlashCommand } from "@sleepymaid/handler";
import { add, formatDistanceToNow } from "date-fns";
import {
	ChatInputCommandInteraction,
	resolveColor,
	ColorResolvable,
	Snowflake,
	AttachmentBuilder,
	PermissionsBitField,
	Colors,
	MessageFlags,
} from "discord.js";
import { HelperClient } from "../../../lib/extensions/HelperClient";
import { intToHexColor } from "@sleepymaid/util";
import { generateSplitImage, getLocalizedProp } from "@sleepymaid/shared";
import i18next from "i18next";

const cooldowns: Record<Snowflake, Date> = {};
const roles = {
	"324284116021542922": "944706938946609232", // LME
	"821717486217986098": "1313988788439093348", // Test
	"796534493535928320": "1312956443850178560", // Fil
	"1150780245151068332": "1311052913552130118", // Mamayo
};

const canFail: Record<Snowflake, number> = {
	"821717486217986098": 0.9, // Test
	"1150780245151068332": 0.5, // Mamayo
};

export default class extends SlashCommand<HelperClient> {
	constructor(context: Context<HelperClient>) {
		super(context, {
			guildIds: Object.keys(roles),
			data: {
				...getLocalizedProp("name", "commands.rainbow.name"),
				...getLocalizedProp("description", "commands.rainbow.description"),
			},
		});
	}

	public override async execute(interaction: ChatInputCommandInteraction<"cached">) {
		const roleID = roles[interaction.guild.id as keyof typeof roles];
		if (!roleID) return;
		const role = interaction.guild.roles.cache.get(roleID);
		if (!role) return;
		if (
			!interaction.member.roles.cache.has(roleID) &&
			!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)
		)
			return interaction.reply({
				content: i18next.t("commands.rainbow.norole", {
					lng: interaction.locale,
					role: roleID,
				}),
				flags: MessageFlags.Ephemeral,
			});

		const cooldown = cooldowns[interaction.guild.id];

		if (cooldown && cooldown.getTime() > Date.now())
			return interaction.reply({
				embeds: [
					{
						color: role.color,
						description: i18next.t("commands.rainbow.cooldown", {
							lng: interaction.locale,
							time: formatDistanceToNow(cooldown.getTime(), {
								includeSeconds: true,
							}),
						}),
					},
				],
				flags: MessageFlags.Ephemeral,
			});

		await interaction.deferReply();

		if (canFail[interaction.guild.id] && role.color !== 0) {
			if (Math.random() < canFail[interaction.guild.id]!) {
				await role.setColor(0, "Failed by: " + interaction.user.tag).then(() => {
					cooldowns[interaction.guild.id] = add(new Date(), { minutes: 5 });
				});
				return interaction.editReply({
					embeds: [
						{
							color: Colors.Greyple,
							description: i18next.t("commands.rainbow.failure", {
								lng: interaction.locale,
							}),
						},
					],
				});
			}
		}

		const getRandomColor = (): ColorResolvable => {
			const letters = "0123456789ABCDEF";
			let color = "#";
			for (let i = 0; i < 6; i++) {
				color += letters[Math.floor(Math.random() * 16)];
			}
			return color as ColorResolvable;
		};

		const oldColor = role.color;
		const color = resolveColor(getRandomColor());

		const buffer = await generateSplitImage(role.color === 0 ? Colors.Greyple : role.color, color);

		const attachmentName = `${role.id}-${color}.png`;
		const attachment = new AttachmentBuilder(buffer, { name: attachmentName });

		await role.setColor(color, "Changed by: " + interaction.user.tag).then(() => {
			cooldowns[interaction.guild.id] = add(new Date(), { minutes: 5 });
		});

		return await interaction.editReply({
			embeds: [
				{
					title: "Rainbow",
					author: {
						name: interaction.user.tag,
						icon_url: interaction.user.displayAvatarURL(),
					},
					color: color,
					description: i18next.t("commands.rainbow.changed", {
						lng: interaction.locale,
						role: roleID,
						oldColor: intToHexColor(oldColor),
						newColor: intToHexColor(color),
					}),
					thumbnail: {
						url: `attachment://${attachmentName}`,
					},
				},
			],
			files: [attachment],
		});
	}
}
