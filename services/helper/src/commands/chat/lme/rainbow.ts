import { Context, SlashCommand } from "@sleepymaid/handler";
import { add } from "date-fns";
import { ChatInputCommandInteraction, resolveColor, ColorResolvable, Snowflake } from "discord.js";
import { HelperClient } from "../../../lib/extensions/HelperClient";

const cooldowns: Record<Snowflake, Date> = {};
const roles = {
	"324284116021542922": "944706938946609232",
	"796534493535928320": "1312956443850178560",
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
		if (!interaction.member.roles.cache.has(roleID))
			return interaction.reply({
				content: "Tu doit avoir le rôle <@&" + roleID + "> pour utiliser cette commande.",
				ephemeral: true,
			});

		const getRandomColor = () => {
			const letters = "0123456789ABCDEF";
			let color = "#";
			for (let i = 0; i < 6; i++) {
				color += letters[Math.floor(Math.random() * 16)];
			}
			return color;
		};

		const cooldown = cooldowns[interaction.guild.id];

		if (cooldown && cooldown.getTime() > Date.now())
			return interaction.reply({
				embeds: [
					{
						color: role.color,
						description: "La commande est en cooldown.",
					},
				],
				ephemeral: true,
			});

		const color = resolveColor(getRandomColor() as ColorResolvable);

		await role.setColor(color, "Changed by: " + interaction.user.tag).then(() => {
			cooldowns[interaction.guild.id] = add(new Date(), { minutes: 5 });
		});

		return await interaction.reply({
			embeds: [
				{
					color: color,
					description: `La couleur du rôle <@&${roleID}> a été changée en #${color}.`,
				},
			],
		});
	}
}
