import { pgTable, pgEnum, text, integer, serial } from "drizzle-orm/pg-core";
import { guildSetting } from "./schema";

export const levelingTrackType = pgEnum("leveling_track_type", ["levels", "points"]);

export const levelingTrack = pgTable("leveling_track", {
	guildId: text("guild_id")
		.notNull()
		.references(() => guildSetting.guildId, { onDelete: "cascade" }),
	trackId: serial("track_id").primaryKey().notNull(),
	trackName: text("track_name").notNull(),
	type: levelingTrackType("type").notNull(),
	globalMultiplier: integer("global_multiplier").default(1).notNull(),
});

export const trackBlacklistedRole = pgTable("track_blacklisted_role", {
	guildId: text("guild_id").notNull(),
	trackId: integer("track_id")
		.notNull()
		.references(() => levelingTrack.trackId, { onDelete: "cascade" }),
	roleId: text("role_id").primaryKey().notNull(),
});

export const trackWhitelistedRole = pgTable("track_whitelisted_role", {
	guildId: text("guild_id").notNull(),
	trackId: integer("track_id")
		.notNull()
		.references(() => levelingTrack.trackId, { onDelete: "cascade" }),
	roleId: text("role_id").primaryKey().notNull(),
});

export const trackRoleMultiplier = pgTable("track_role_multiplier", {
	guildId: text("guild_id").notNull(),
	trackId: integer("track_id")
		.notNull()
		.references(() => levelingTrack.trackId, { onDelete: "cascade" }),
	roleId: text("role_id").primaryKey().notNull(),
	multiplier: integer("multiplier").default(1).notNull(),
});

export const trackChannelMultiplier = pgTable("track_channel_multiplier", {
	guildId: text("guild_id").notNull(),
	trackId: integer("track_id")
		.notNull()
		.references(() => levelingTrack.trackId, { onDelete: "cascade" }),
	channelId: text("channel_id").primaryKey().notNull(),
	multiplier: integer("multiplier").default(1).notNull(),
});
