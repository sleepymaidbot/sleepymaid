import { Context, SlashCommand } from "@sleepymaid/handler"
import { add } from "date-fns"
import {
	ChatInputCommandInteraction,
	resolveColor,
	ColorResolvable,
	Snowflake,
	AttachmentBuilder,
	PermissionsBitField,
	Colors,
	MessageFlags,
	GuildFeature,
	RoleColorsResolvable,
	Constants,
} from "discord.js"
import { ComponentType } from "discord-api-types/v10"
import { HelperClient } from "../../../lib/extensions/HelperClient"
import { intToHexColor } from "@sleepymaid/util"
import { generateSplitImage, getLocalizedProp } from "@sleepymaid/shared"
import i18next from "i18next"

const cooldowns: Record<Snowflake, Date> = {}
const roles = {
	"324284116021542922": "944706938946609232", // LME
	"821717486217986098": "1313988788439093348", // Test
	"796534493535928320": "1312956443850178560", // Fil
	"1150780245151068332": "1311052913552130118", // Mamayo
}

const canFail: Record<Snowflake, number> = {
	"821717486217986098": 0.1, // Test
	"1150780245151068332": 0.15, // Mamayo
}

export default class extends SlashCommand<HelperClient> {
	constructor(context: Context<HelperClient>) {
		super(context, {
			guildIds: Object.keys(roles),
			data: {
				...getLocalizedProp("name", "commands.rainbow.name"),
				...getLocalizedProp("description", "commands.rainbow.description"),
			},
		})
	}

	public override async execute(interaction: ChatInputCommandInteraction<"cached">) {
		const roleID = roles[interaction.guild.id as keyof typeof roles]
		if (!roleID) return
		const role = await interaction.guild.roles.fetch(roleID)
		if (!role) return
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
			})

		const cooldown = cooldowns[interaction.guild.id]

		if (cooldown && cooldown.getTime() > Date.now()) {
			const cooldownText = i18next.t("commands.rainbow.cooldown", {
				lng: interaction.locale,
				time: `<t:${Math.floor(cooldown.getTime() / 1000)}:R>`,
			})
			return interaction.reply({
				components: [{ type: ComponentType.TextDisplay, content: cooldownText }],
				flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
			})
		}

		await interaction.deferReply()

		if (canFail[interaction.guild.id] && role.color !== 0) {
			if (Math.random() < canFail[interaction.guild.id]!) {
				await role.setColors({ primaryColor: 0 }, "Failed by: " + interaction.user.tag).then(() => {
					cooldowns[interaction.guild.id] = add(new Date(), { minutes: 5 })
				})
				return interaction.editReply({
					embeds: [
						{
							color: Colors.Greyple,
							description: i18next.t("commands.rainbow.failure", {
								lng: interaction.locale,
							}),
						},
					],
				})
			}
		}

		if (!interaction.appPermissions.has(PermissionsBitField.Flags.ManageRoles)) {
			return interaction.editReply({
				embeds: [
					{
						color: Colors.Greyple,
						description: i18next.t("commands.rainbow.missingPermissions", {
							lng: interaction.locale,
						}),
					},
				],
			})
		}

		const getRandomColor = (): ColorResolvable => {
			const letters = "0123456789ABCDEF"
			let color = "#"
			for (let i = 0; i < 6; i++) {
				color += letters[Math.floor(Math.random() * 16)]
			}
			return color as ColorResolvable
		}

		const oldColor = role.colors
		const hasEnhancedColors = interaction.guild.features.includes(GuildFeature.EnhancedRoleColors)

		const primaryColorNum = resolveColor(getRandomColor())
		let color: RoleColorsResolvable = {
			primaryColor: primaryColorNum,
		}

		if (hasEnhancedColors) {
			const odds = Math.floor(Math.random() * 10) + 1
			if (odds === 1) {
				color = {
					primaryColor: Constants.HolographicStyle.Primary,
					secondaryColor: Constants.HolographicStyle.Secondary,
					tertiaryColor: Constants.HolographicStyle.Tertiary,
				}
			} else {
				color = {
					primaryColor: primaryColorNum,
					secondaryColor: resolveColor(getRandomColor()),
					...(odds === 1 && { tertiaryColor: resolveColor(getRandomColor()) }),
				}
			}
		}

		const buffer = await generateSplitImage(
			role.colors.primaryColor === 0 ? Colors.Greyple : role.colors.primaryColor,
			primaryColorNum,
		)

		const attachmentName = `${role.id}-${color}.png`
		const attachment = new AttachmentBuilder(buffer, { name: attachmentName })

		await role.setColors(color, `Changed by: ${interaction.user.tag}`).then(() => {
			cooldowns[interaction.guild.id] = add(new Date(), { minutes: 5 })
		})

		const oldEnhanced = oldColor.secondaryColor != null
		const newHolographic = color.primaryColor === Constants.HolographicStyle.Primary
		const newEnhanced = color.secondaryColor != null

		let messageKey: string
		const baseVars = {
			lng: interaction.locale,
			role: roleID,
			oldColor: intToHexColor(oldColor.primaryColor),
			newColor: intToHexColor(color.primaryColor as number),
		}
		if (newHolographic && oldEnhanced) {
			messageKey = "commands.rainbow.changedHolographic"
		} else if (newEnhanced && oldEnhanced) {
			messageKey = "commands.rainbow.changedEnhanced"
		} else if (newHolographic) {
			messageKey = "commands.rainbow.changedNewHolographic"
		} else if (newEnhanced) {
			messageKey = "commands.rainbow.changedNewEnhanced"
		} else {
			messageKey = "commands.rainbow.changed"
		}
		const description = i18next.t(messageKey, {
			...baseVars,
			oldColor2: oldColor.secondaryColor != null ? intToHexColor(resolveColor(oldColor.secondaryColor)) : "",
			newColor2: color.secondaryColor != null ? intToHexColor(resolveColor(color.secondaryColor)) : "",
		})
		return await interaction.editReply({
			components: [
				{
					type: ComponentType.Section,
					components: [
						{
							type: ComponentType.TextDisplay,
							content: `# 🌈 Rainbow\n${description}`,
						},
					],
					accessory: {
						type: ComponentType.Thumbnail,
						media: { url: `attachment://${attachmentName}` },
					},
				},
			],
			allowedMentions: { parse: [] },
			files: [attachment],
			flags: [MessageFlags.IsComponentsV2],
		})
	}
}
