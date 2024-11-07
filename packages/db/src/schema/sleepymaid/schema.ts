import { relations, sql } from "drizzle-orm";
import { pgTable, text, boolean, bigint, timestamp, integer } from "drizzle-orm/pg-core";
import { randomBitrate } from "../helper/randombitrate";
import { roleMenu } from "./rolemenu";
import { quickMessage } from "./quickMessage";

export const guildSetting = pgTable("guild_setting", {
	guildId: text("guild_id").primaryKey().notNull(),
	guildName: text("guild_name").notNull(),
	guildIcon: text("icon"),
	sanitizerEnabled: boolean("sanitizer_enabled").default(false).notNull(),
	sanitizerIgnoredRoles: text("sanitizer_ignored_roles")
		.array()
		.default(sql`'{}'`)
		.notNull(),
	adminRoles: text("admin_roles")
		.array()
		.default(sql`'{}'`)
		.notNull(),
	modRoles: text("mod_roles")
		.array()
		.default(sql`'{}'`)
		.notNull(),
});

export const guildSettingRelations = relations(guildSetting, ({ many }) => ({
	randomBitrateChannels: many(randomBitrate, {
		relationName: "randomBitrateChannels",
	}),
	roleMenus: many(roleMenu, {
		relationName: "roleMenus",
	}),
	quickMessages: many(quickMessage, {
		relationName: "quickMessages",
	}),
}));

export const userData = pgTable("user_data", {
	// Basic Information
	userId: text("user_id").notNull().primaryKey(),
	userName: text("user_name").notNull(),
	displayName: text("display_name"),
	userAvatar: text("user_avatar"),

	// Economy
	currency: bigint({ mode: "number" }).default(0).notNull(),

	// Economy Cooldowns Timestamps
	dailyTimestamp: timestamp("daily_timestamp"),
	dailyStreak: integer("daily_streak").default(0),
	weeklyTimestamp: timestamp("weekly_timestamp"),
	weeklyStreak: integer("weekly_streak").default(0),
	monthlyTimestamp: timestamp("monthly_timestamp"),
	monthlyStreak: integer("monthly_streak").default(0),
	workTimestamp: timestamp("work_timestamp"),
});
