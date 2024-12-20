import { Context, SlashCommand } from "@sleepymaid/handler";
import { add, formatDistanceToNow } from "date-fns";
import {
	ChatInputCommandInteraction,
	resolveColor,
	ColorResolvable,
	Snowflake,
	AttachmentBuilder,
	PermissionsBitField,
} from "discord.js";
import { HelperClient } from "../../../lib/extensions/HelperClient";
import { intToHexColor } from "@sleepymaid/util";
import { generateSplitImage } from "@sleepymaid/shared";

const cooldowns: Record<Snowflake, Date> = {};
const roles = {
	"324284116021542922": "944706938946609232", // LME
	"821717486217986098": "1313988788439093348", // Test
	"796534493535928320": "1312956443850178560", // Fil
	"1150780245151068332": "1311052913552130118", // Mamayo
};

export default class extends SlashCommand<HelperClient> {
	constructor(context: Context<HelperClient>) {
		super(context, {
			guildIds: Object.keys(roles),
			data: {
				name: "rainbow",
				description: "Change la couleur du rôle rainbow.",
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
				content: "Tu doit avoir le rôle <@&" + roleID + "> pour utiliser cette commande.",
				ephemeral: true,
			});

		const getRandomColor = (): ColorResolvable => {
			const letters = "0123456789ABCDEF";
			let color = "#";
			for (let i = 0; i < 6; i++) {
				color += letters[Math.floor(Math.random() * 16)];
			}
			return color as ColorResolvable;
		};

		const cooldown = cooldowns[interaction.guild.id];

		if (cooldown && cooldown.getTime() > Date.now())
			return interaction.reply({
				embeds: [
					{
						color: role.color,
						description: `La commande est en cooldown. Tu peux la réutiliser dans ${formatDistanceToNow(
							cooldown.getTime(),
							{
								includeSeconds: true,
							},
						)}`,
					},
				],
				ephemeral: true,
			});

		const oldColor = role.color;
		const color = resolveColor(getRandomColor());

		const buffer = await generateSplitImage(role.color, color);

		const attachmentName = `${role.id}-${color}.png`;
		const attachment = new AttachmentBuilder(buffer, { name: attachmentName });

		await role.setColor(color, "Changed by: " + interaction.user.tag).then(() => {
			cooldowns[interaction.guild.id] = add(new Date(), { minutes: 5 });
		});

		return await interaction.reply({
			embeds: [
				{
					title: "Rainbow",
					author: {
						name: interaction.user.tag,
						icon_url: interaction.user.displayAvatarURL(),
					},
					color: color,
					description: `La couleur du rôle <@&${roleID}> a été changée de **${intToHexColor(oldColor)}** à **${intToHexColor(color)}**`,
					thumbnail: {
						url: `attachment://${attachmentName}`,
					},
				},
			],
			files: [attachment],
		});
	}
}
