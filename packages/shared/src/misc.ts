import { ChannelType, parseEmoji as parseEmojiDiscordJS } from "discord.js"

export function formatNumber(number: number): string {
	return new Intl.NumberFormat("en-US", { useGrouping: true }).format(number)
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
}

export function isUnicodeEmoji(emoji: string): boolean {
	return /\p{Emoji}/u.test(emoji)
}

export type ParsedEmoji =
	| {
			type: "custom"
			id: string // Used for custom emojis
			name: string
	  }
	| {
			type: "unicode"
			name: string
	  }

export function parseEmoji(str: string, filterOut?: "custom" | "unicode" | "all"): ParsedEmoji | null {
	const parse = parseEmojiDiscordJS(str)
	if (!parse) return null
	if (parse.id && (filterOut === "custom" || filterOut === "all"))
		return { type: "custom" as const, id: parse.id, name: parse.name }
	if (isUnicodeEmoji(parse.name) && (filterOut === "unicode" || filterOut === "all"))
		return { type: "unicode" as const, name: parse.name }
	return null
}
