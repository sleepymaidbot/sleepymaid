import { Context, Listener } from "@sleepymaid/handler"
import { APIEmbed, Colors, GuildMember } from "discord.js"
import { WatcherClient } from "../../../lib/extensions/WatcherClient"

export default class extends Listener<"guildMemberRemove", WatcherClient> {
	public constructor(context: Context<WatcherClient>) {
		super(context, {
			name: "guildMemberRemove",
			once: false,
		})
	}

	public override async execute(member: GuildMember) {
		const channels = (await this.container.manager.getLogChannel(member.guild.id))?.filter((c) => c.memberEvents.leave)
		if (!channels || channels.length === 0) return

		const embed: APIEmbed = {
			title: "Member Left",
			color: Colors.Red,
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
		}

		for (const channel of channels) {
			await this.container.manager.sendLog(channel, { embeds: [embed] })
		}
	}
}
