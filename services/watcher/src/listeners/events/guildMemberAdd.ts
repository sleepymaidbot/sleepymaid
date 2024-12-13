import { Context, Listener } from "@sleepymaid/handler";
import { WatcherClient } from "../../lib/extensions/WatcherClient";
import { GuildMember, Colors, APIEmbed } from "discord.js";

export default class extends Listener<"guildMemberAdd", WatcherClient> {
	public constructor(context: Context<WatcherClient>) {
		super(context, {
			name: "guildMemberAdd",
			once: false,
		});
	}

	public override async execute(member: GuildMember) {
		const channels = (await this.container.manager.getLogChannel(member.guild.id))?.filter((c) => c.memberEvents.join);
		if (!channels || channels.length === 0) return;

		const embed: APIEmbed = {
			title: "Member Joined",
			color: Colors.Green,
			thumbnail: {
				url: member.user.displayAvatarURL(),
			},
			fields: [
				{
					name: "User",
					value: `${member.displayName} (${member.id})`,
					inline: true,
				},
			],
			timestamp: new Date().toISOString(),
		};

		for (const channel of channels) {
			await this.container.manager.sendLog(channel, { embeds: [embed] });
		}
	}
}
