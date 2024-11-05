import { boolean, pgEnum, pgTable, serial, text } from "drizzle-orm/pg-core";
import { guildSetting } from "../sleepymaid/schema";

export const logChannelType = pgEnum("Log_channel_type", ["server", "mod"]);
export const caseType = pgEnum("case_type", ["untimeout", "timeout", "kick", "unban", "ban"]);

export const logChannel = pgTable("log_channel", {
	guildId: text("guild_id")
		.notNull()
		.references(() => guildSetting.guildId, { onDelete: "cascade" }),
	channelId: text("channel_id").primaryKey().notNull(),
	type: logChannelType("type").notNull(),
	webhookId: text("webhookId").notNull(),
	webhookToken: text("webhook_token").notNull(),
	threadId: text("thread_id"),
	timeout: boolean("timeout").default(false).notNull(),
	untimeout: boolean("untimeout").default(false).notNull(),
	kick: boolean("kick").default(false).notNull(),
	ban: boolean("ban").default(false).notNull(),
	unban: boolean("unban").default(false).notNull(),
	messageEdit: boolean("messageEdit").default(false).notNull(),
	messageDelete: boolean("messageDelete").default(false).notNull(),
	memberJoin: boolean("memberJoin").default(false).notNull(),
	memberLeave: boolean("memberLeave").default(false).notNull(),
	memberNicknameChange: boolean("memberNicknameChange").default(false).notNull(),
	memberRoleChange: boolean("memberRoleChange").default(false).notNull(),
	memberAvatarChange: boolean("memberAvatarChange").default(false).notNull(),
	memberUsernameChange: boolean("memberUsernameChange").default(false).notNull(),
	memberVoiceStateUpdate: boolean("memberVoiceStateUpdate").default(false).notNull(),
	roleCreate: boolean("roleCreate").default(false).notNull(),
	roleDelete: boolean("roleDelete").default(false).notNull(),
	roleUpdate: boolean("roleUpdate").default(false).notNull(),
	channelCreate: boolean("channelCreate").default(false).notNull(),
	channelDelete: boolean("channelDelete").default(false).notNull(),
	channelUpdate: boolean("channelUpdate").default(false).notNull(),
	emojiCreate: boolean("emojiCreate").default(false).notNull(),
	emojiDelete: boolean("emojiDelete").default(false).notNull(),
	emojiUpdate: boolean("emojiUpdate").default(false).notNull(),
	inviteCreate: boolean("inviteCreate").default(false).notNull(),
	inviteDelete: boolean("inviteDelete").default(false).notNull(),
});

export const modCase = pgTable("case", {
	guildId: text("guild_id")
		.notNull()
		.references(() => guildSetting.guildId, { onDelete: "cascade" }),
	caseNumber: serial("case_number").primaryKey().notNull(),
	messageId: text("message_id").notNull(),
	userId: text("user_id").notNull(),
	reason: text("reason"),
	type: caseType("type").notNull(),
	modId: text("mod_id"),
});
