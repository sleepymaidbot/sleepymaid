import { Context, Listener } from "@sleepymaid/handler";
import { WatcherClient } from "../../lib/extensions/WatcherClient";
import { APIEmbed, Colors, VoiceState } from "discord.js";

export default class extends Listener<"voiceStateUpdate", WatcherClient> {
	constructor(context: Context<WatcherClient>) {
		super(context, {
			name: "voiceStateUpdate",
			once: false,
		});
	}

	public override async execute(oldState: VoiceState, newState: VoiceState) {
		const channels = (await this.container.manager.getLogChannel(oldState.guild.id))?.filter(
			(c) => c.memberEvents.voiceStateUpdate,
		);
		if (!channels || channels.length === 0) return;

		const embed: APIEmbed = {};

		// Join Channel
		if (!oldState.channel && newState.channel) {
			embed.title = "User joined voice channel";
			embed.color = Colors.Green;
			embed.fields = [
				{
					name: "User",
					value: `<@${newState.member?.id}>`,
					inline: true,
				},
				{
					name: "Channel",
					value: `<#${newState.channel?.id}>`,
					inline: true,
				},
			];
		}

		// Leave Channel
		else if (oldState.channel && !newState.channel) {
			embed.title = "User left voice channel";
			embed.color = Colors.Red;
			embed.fields = [
				{
					name: "User",
					value: `<@${newState.member?.id}>`,
					inline: true,
				},
				{
					name: "Channel",
					value: `<#${oldState.channel?.id}>`,
					inline: true,
				},
			];
		}

		// Change Channel
		else if (oldState.channel?.id !== newState.channel?.id) {
			embed.title = "User switched voice channel";
			embed.color = Colors.Blurple;
			embed.fields = [
				{
					name: "User",
					value: `<@${newState.member?.id}>`,
					inline: true,
				},
				{
					name: "Old Channel",
					value: `<#${oldState.channel?.id}>`,
					inline: true,
				},
				{
					name: "New Channel",
					value: `<#${newState.channel?.id}>`,
					inline: true,
				},
			];
		}

		if (!embed.title) return;

		embed.thumbnail = {
			url: oldState.member?.avatarURL() ?? "",
		};

		embed.timestamp = new Date().toISOString();

		for (const channel of channels) {
			await this.container.manager.sendLog(channel, [embed]);
		}
	}
}
