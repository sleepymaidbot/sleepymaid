import { jsonb, pgTable, text } from "drizzle-orm/pg-core";
import { type APIEmbed } from "discord-api-types/v10";
import { relations } from "drizzle-orm";
import { guildSetting } from "./schema";

export const quickMessage = pgTable("quick_message", {
	guildId: text("guild_id").notNull(),
	channelId: text("channel_id").notNull(),
	messageId: text("message_id"),
	messageName: text("message_name").notNull(),
	messageUUID: text("message_uuid").notNull(),
	messageData: jsonb("message_data").notNull().$type<{
		content: string;
		embeds: Array<APIEmbed>;
	}>(),
});

export const quickMessageRelations = relations(quickMessage, ({ one }) => ({
	guildsSettings: one(guildSetting, {
		fields: [quickMessage.guildId],
		references: [guildSetting.guildId],
		relationName: "quickMessages",
	}),
}));
