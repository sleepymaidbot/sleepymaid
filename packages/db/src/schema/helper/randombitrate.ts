import { relations } from "drizzle-orm";
import { boolean, pgTable, text } from "drizzle-orm/pg-core";
import { guildSetting } from "../sleepymaid/schema";

export const randomBitrate = pgTable("random_bitrate", {
	guildId: text("server_id").references(() => guildSetting.guildId, { onDelete: "cascade" }),
	channelId: text("channel_id").primaryKey(),
	enabled: boolean("boolean").default(false),
});

export const randomBitrateRelations = relations(randomBitrate, ({ one }) => ({
	guildsSettings: one(guildSetting, {
		fields: [randomBitrate.guildId],
		references: [guildSetting.guildId],
		relationName: "random_bitrate_channels",
	}),
}));
