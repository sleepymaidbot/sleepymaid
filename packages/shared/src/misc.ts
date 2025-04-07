import { ChannelType } from "discord.js";

export function formatNumber(number: number): string {
	return new Intl.NumberFormat("en-US", { useGrouping: true }).format(number);
}

export const channelNames: Partial<Record<ChannelType, string>> = {
	[ChannelType.GuildText]: "Text Channel",
	[ChannelType.GuildVoice]: "Voice Channel",
	[ChannelType.GuildCategory]: "Category",
	[ChannelType.GuildStageVoice]: "Stage Channel",
	[ChannelType.GuildForum]: "Forum Channel",
	[ChannelType.GuildAnnouncement]: "Announcement Channel",
	[ChannelType.GuildDirectory]: "Directory Channel",
	[ChannelType.GuildMedia]: "Media Channel",
};
