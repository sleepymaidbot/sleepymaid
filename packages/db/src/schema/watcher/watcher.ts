import { integer, jsonb, pgEnum, pgTable, primaryKey, serial, text, timestamp } from "drizzle-orm/pg-core"
import { guildSettings } from "../sleepymaid/schema"

export const caseType = pgEnum("case_type", ["untimeout", "timeout", "kick", "unban", "ban", "warn", "unmute", "mute"])

export const types = {
	moderationEvents: {
		timeout: "Timeout",
		untimeout: "Untimeout",
		kick: "Kick",
		ban: "Ban",
		unban: "Unban",
		warn: "Warn",
		unmute: "Unmute",
		mute: "Mute",
	},
	memberEvents: {
		join: "Join",
		leave: "Leave",
		nicknameChange: "Nickname Change",
		roleChange: "Role Change",
		avatarChange: "Avatar Change",
		usernameChange: "Username Change",
		voiceStateUpdate: "Voice State Update",
	},
	messageEvents: {
		edit: "Message Edit",
		delete: "Message Delete",
	},
	roleEvents: {
		create: "Role Create",
		delete: "Role Delete",
		update: "Role Update",
	},
	channelEvents: {
		create: "Channel Create",
		delete: "Channel Delete",
		update: "Channel Update",
	},
	emojiEvents: {
		create: "Emoji Create",
		delete: "Emoji Delete",
		update: "Emoji Update",
	},
	inviteEvents: {
		create: "Invite Create",
		delete: "Invite Delete",
	},
}

export const logChannel = pgTable("log_channel", {
	id: serial("id").primaryKey().notNull(),
	guildId: text("guild_id")
		.notNull()
		.references(() => guildSettings.guildId, { onDelete: "cascade" }),
	channelId: text("channel_id").notNull(),
	webhookId: text("webhook_id").notNull(),
	webhookToken: text("webhook_token").notNull(),
	threadId: text("thread_id"),

	moderationEvents: jsonb("moderation_events")
		.default({
			timeout: false,
			untimeout: false,
			kick: false,
			ban: false,
			unban: false,
			warn: false,
			unmute: false,
			mute: false,
		})
		.notNull()
		.$type<Record<keyof typeof types.moderationEvents, boolean>>(),
	memberEvents: jsonb("member_events")
		.default({
			join: false,
			leave: false,
			nicknameChange: false,
			roleChange: false,
			avatarChange: false,
			usernameChange: false,
			voiceStateUpdate: false,
		})
		.notNull()
		.$type<Record<keyof typeof types.memberEvents, boolean>>(),
	messageEvents: jsonb("message_events")
		.default({
			edit: false,
			delete: false,
		})
		.notNull()
		.$type<Record<keyof typeof types.messageEvents, boolean>>(),
	roleEvents: jsonb("role_events")
		.default({
			create: false,
			delete: false,
			update: false,
		})
		.notNull()
		.$type<Record<keyof typeof types.roleEvents, boolean>>(),
	channelEvents: jsonb("channel_events")
		.default({
			create: false,
			delete: false,
			update: false,
		})
		.notNull()
		.$type<Record<keyof typeof types.channelEvents, boolean>>(),
	emojiEvents: jsonb("emoji_events")
		.default({
			create: false,
			delete: false,
			update: false,
		})
		.notNull()
		.$type<Record<keyof typeof types.emojiEvents, boolean>>(),
	inviteEvents: jsonb("invite_events")
		.default({
			create: false,
			delete: false,
		})
		.notNull()
		.$type<Record<keyof typeof types.inviteEvents, boolean>>(),
})

export const roleWeight = pgTable(
	"role_weight",
	{
		guildId: text("guild_id")
			.notNull()
			.references(() => guildSettings.guildId, { onDelete: "cascade" }),
		roleId: text("role_id").notNull(),
		weight: integer("weight").notNull().default(0),
	},
	(table) => [primaryKey({ columns: [table.guildId, table.roleId] })],
)

export const modCase = pgTable(
	"case",
	{
		guildId: text("guild_id")
			.notNull()
			.references(() => guildSettings.guildId, { onDelete: "cascade" }),
		caseNumber: integer("case_number").notNull(),
		messageId: text("message_id").notNull(),
		userId: text("user_id").notNull(),
		reason: text("reason"),
		type: caseType("type").notNull(),
		modId: text("mod_id"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		expiresAt: timestamp("expires_at"),
		resolvedAt: timestamp("resolved_at"),
	},
	(table) => [primaryKey({ columns: [table.guildId, table.caseNumber] })],
)
