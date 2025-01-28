import type { Context } from "@sleepymaid/handler";
import { Listener } from "@sleepymaid/handler";
import { MessageFlags, type BaseInteraction } from "discord.js";
import type { HelperClient } from "../../lib/extensions/HelperClient";

export default class SelfRoleListener extends Listener<"interactionCreate", HelperClient> {
	public constructor(context: Context<HelperClient>) {
		super(context, {
			name: "interactionCreate",
			once: false,
		});
	}

	public override async execute(interaction: BaseInteraction) {
		if (!interaction.inCachedGuild()) return;
		if (!interaction.isButton()) return;
		if (!interaction.customId.startsWith("selfrole:")) return;
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });
		const roleId = interaction.customId.split(":")[1];
		if (!roleId) return interaction.editReply({ content: "Something went wrong." });
		const role = interaction.guild?.roles.cache.get(roleId);
		if (!role) return interaction.editReply({ content: "Something went wrong." });
		if (!interaction.member) return interaction.editReply({ content: "Something went wrong." });
		if (!interaction.channel) return interaction.editReply({ content: "Something went wrong." });
		if (interaction.member.roles.cache.has(roleId)) {
			await interaction.member.roles.remove(
				roleId,
				`Selfrole in #${interaction.channel.name} (${interaction.channel.id})`,
			);
			return interaction.editReply({
				content: `You no longer have the role ${role.toString()}`,
				allowedMentions: { parse: [] },
			});
		} else {
			await interaction.member.roles.add(
				roleId,
				`Selfrole in #${interaction.channel.name} (${interaction.channel.id})`,
			);
			return interaction.editReply({
				content: `You now have the role ${role.toString()}`,
				allowedMentions: { parse: [] },
			});
		}
	}
}
