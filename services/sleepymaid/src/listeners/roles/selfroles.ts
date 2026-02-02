import type { Context } from "@sleepymaid/handler"
import { Listener } from "@sleepymaid/handler"
import type { BaseInteraction } from "discord.js"
import { MessageFlags } from "discord-api-types/v10"
import { SleepyMaidClient } from "../../lib/SleepyMaidClient"

export default class SelfRoleListener extends Listener<"interactionCreate", SleepyMaidClient> {
	public constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			name: "interactionCreate",
			once: false,
		})
	}

	public override async execute(interaction: BaseInteraction) {
		if (!interaction.inCachedGuild()) return
		if (!interaction.isButton()) return
		if (!interaction.customId.startsWith("selfrole:")) return
		await interaction.deferReply({ flags: MessageFlags.Ephemeral })
		const [_, roleId, action] = interaction.customId.split(":")
		if (!roleId || !action) return interaction.editReply({ content: "Something went wrong." })
		const role = interaction.guild?.roles.cache.get(roleId)
		if (!role) return interaction.editReply({ content: "Something went wrong." })
		if (!interaction.member) return interaction.editReply({ content: "Something went wrong." })
		if (!interaction.channel) return interaction.editReply({ content: "Something went wrong." })
		if (interaction.member.roles.cache.has(roleId)) {
			if (action === "add") return interaction.editReply({ content: "You already have the role." })
			await interaction.member.roles.remove(
				roleId,
				`Selfrole in #${interaction.channel.name} (${interaction.channel.id})`,
			)
			return interaction.editReply({
				content: `You no longer have the role ${role.toString()}`,
				allowedMentions: { parse: [] },
			})
		} else {
			if (action === "remove") return interaction.editReply({ content: "You don't have the role yet." })
			await interaction.member.roles.add(roleId, `Selfrole in #${interaction.channel.name} (${interaction.channel.id})`)
			return interaction.editReply({
				content: `You now have the role ${role.toString()}`,
				allowedMentions: { parse: [] },
			})
		}
	}
}
