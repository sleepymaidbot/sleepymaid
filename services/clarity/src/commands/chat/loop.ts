import type { Context } from "@sleepymaid/handler";
import { SlashCommand } from "@sleepymaid/handler";
import { ApplicationCommandOptionType, type ChatInputCommandInteraction } from "discord.js";
import { ClarityClient } from "../../lib/ClarityClient";
import { QueueRepeatMode, useQueue } from "discord-player";

export default class extends SlashCommand<ClarityClient> {
	public constructor(context: Context<ClarityClient>) {
		super(context, {
			data: {
				name: "loop",
				description: "loop the queue in different modes",
				options: [
					{
						name: "mode",
						description: "The mode to loop the queue in",
						type: ApplicationCommandOptionType.Number,
						required: true,
						choices: [
							{
								name: "Off",
								value: QueueRepeatMode.OFF,
							},
							{
								name: "Track",
								value: QueueRepeatMode.TRACK,
							},
							{
								name: "Queue",
								value: QueueRepeatMode.QUEUE,
							},
							{
								name: "Autoplay",
								value: QueueRepeatMode.AUTOPLAY,
							},
						],
					},
				],
			},
		});
	}

	public override async execute(interaction: ChatInputCommandInteraction<"cached">) {
		const queue = useQueue();

		if (!queue) {
			return interaction.reply("This server does not have an active player session.");
		}

		const loopMode = interaction.options.getNumber("mode", true) as QueueRepeatMode;

		queue.setRepeatMode(loopMode);

		const modeName = {
			[QueueRepeatMode.OFF]: "Off",
			[QueueRepeatMode.TRACK]: "Track",
			[QueueRepeatMode.QUEUE]: "Queue",
			[QueueRepeatMode.AUTOPLAY]: "Autoplay",
		};

		return interaction.reply(`Loop mode set to ${modeName[loopMode]}`);
	}
}
