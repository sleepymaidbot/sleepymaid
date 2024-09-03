import { inspect } from "node:util";
import { EmbedBuilder } from "@discordjs/builders";
import { Listener } from "@sleepymaid/handler";
import type { Context } from "@sleepymaid/handler";
import type { Message } from "discord.js";
import type { SleepyMaidClient } from "../../lib/extensions/SleepyMaidClient";

export default class SetupListener extends Listener<"messageCreate", SleepyMaidClient> {
	public constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			name: "messageCreate",
			once: false,
		});
	}

	public override async execute(message: Message) {
		if (message.author.id !== "324281236728053760") return;
		const client = this.container.client;
		if (!client.user) return;
		if (!message.content.startsWith("<@" + client.user.id + "> eval")) return;
		const channel = message.channel;
		if (!channel.isTextBased()) return;
		if (channel.isDMBased()) return;
		const codetoeval = message.content.split(" ").slice(2).join(" ");
		try {
			if (codetoeval.includes(`token` || `env` || `message.channel.delete` || `message.guild.delete` || `delete`)) {
				return await channel.send(`no`);
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
				// @ts-expect-error @ts-ignore
				const output = error.message;
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
