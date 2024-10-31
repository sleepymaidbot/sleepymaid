import { inspect } from "node:util";
import { EmbedBuilder } from "@discordjs/builders";
import { Listener, type Context } from "@sleepymaid/handler";
import type { Message } from "discord.js";
import type { HelperClient } from "../../lib/extensions/HelperClient";

export default class SetupListener extends Listener<"messageCreate", HelperClient> {
	public constructor(context: Context<HelperClient>) {
		super(context, {
			name: "messageCreate",
			once: false,
		});
	}

	public override async execute(message: Message) {
		const client = this.container.client;
		if (message.author.id !== "324281236728053760") return;
		if (!client.user) return;
		if (!message.content.startsWith("<@" + client.user.id + "> eval")) return;
		const channel = message.channel;
		if (!channel.isTextBased()) return;
		if (channel.isDMBased()) return;
		const codetoeval = message.content.split(" ").slice(2).join(" ");
		try {
			if (
				codetoeval.includes("token") ||
				codetoeval.includes("env") ||
				codetoeval.includes("message.channel.delete") ||
				codetoeval.includes("message.guild.delete") ||
				codetoeval.includes("delete")
			) {
				return await channel.send("no");
			}

			const evalOutputEmbed = new EmbedBuilder().setTitle("Evaluated Code").addFields([
				{
					name: `:inbox_tray: **Input**`,
					value: `\`\`\`js\n${codetoeval}\`\`\``,
				},
			]);

			try {
				// eslint-disable-next-line no-eval
				const output = await eval(`(async () => {${codetoeval}})()`);
				if (inspect(output).includes(client.config.discordToken || "message.channel.delete()")) {
					return await channel.send(`no`);
				}

				if (inspect(output, { depth: 0 }).length > 1_000) {
					return;
				} else {
					evalOutputEmbed.addFields([
						{
							name: `:outbox_tray: **Output**`,
							value: `\`\`\`js\n${inspect(output, { depth: 0 })}\`\`\``,
						},
					]);
				}

				await channel.send({ embeds: [evalOutputEmbed] });
			} catch (error) {
				const output = (error as Error).message;
				if (inspect(output).includes(client.config.discordToken || "message.channel.delete()")) {
					return await channel.send(`no`);
				}

				if (inspect(output, { depth: 0 }).length > 1_000) {
					return;
				} else {
					evalOutputEmbed.addFields([
						{
							name: `:outbox_tray: **Error**`,
							value: `\`\`\`js\n${inspect(output, { depth: 0 })}\`\`\``,
						},
					]);
				}

				await channel.send({ embeds: [evalOutputEmbed] });
				client.logger.error(error as Error);
			}
		} catch (error) {
			client.logger.error(error as Error);
		}

		return null;
	}
}
