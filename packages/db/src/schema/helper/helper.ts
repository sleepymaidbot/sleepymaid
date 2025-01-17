import { relations } from "drizzle-orm";
import { boolean, integer, pgTable, text } from "drizzle-orm/pg-core";
import { guildSettings, userData } from "../sleepymaid/schema";

export const randomBitrate = pgTable("random_bitrate", {
	guildId: text("server_id").references(() => guildSettings.guildId, { onDelete: "cascade" }),
	channelId: text("channel_id").primaryKey(),
	enabled: boolean("boolean").default(false),
});

export const randomBitrateRelations = relations(randomBitrate, ({ one }) => ({
	guildsSettings: one(guildSettings, {
		fields: [randomBitrate.guildId],
		references: [guildSettings.guildId],
		relationName: "random_bitrate_channels",
	}),
}));

export const disconnectCounter = pgTable("disconnect_counter", {
	userId: text("user_id")
		.primaryKey()
		.references(() => userData.userId, { onDelete: "cascade" }),
	count: integer("count").default(0),
});
