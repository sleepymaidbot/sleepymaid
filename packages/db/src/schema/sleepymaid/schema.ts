import { relations, sql } from "drizzle-orm";
import { pgTable, text, boolean, bigint, timestamp, integer, serial } from "drizzle-orm/pg-core";
import { randomBitrate } from "../helper/randombitrate";
import { roleMenu } from "./rolemenu";
import { quickMessage } from "./quickMessage";
import { permissionKeys } from "@sleepymaid/shared";

export const guildSettings = pgTable("guild_settings", {
	// Basic Information
	guildId: text("guild_id").primaryKey().notNull(),
	guildName: text("guild_name").notNull(),
	guildIcon: text("icon"),

	// Premium config
	premiumLevel: integer("premium_level").default(0).notNull(),

	// Sanitizer
	sanitizerEnabled: boolean("sanitizer_enabled").default(false).notNull(),
	sanitizerIgnoredRoles: text("sanitizer_ignored_roles")
		.array()
		.default(sql`'{}'`)
		.notNull(),
});

export const rolePermissions = pgTable("role_permissions", {
	guildId: text("guild_id")
		.notNull()
		.references(() => guildSettings.guildId, { onDelete: "cascade" }),
	roleId: text("role_id").notNull(),
	permission: text("permission").notNull().$type<(typeof permissionKeys)[number]>(),
	value: boolean("value").notNull().default(false),
});

export const autoRoles = pgTable("auto_roles", {
	guildId: text("guild_id")
		.notNull()
		.references(() => guildSettings.guildId, { onDelete: "cascade" }),
	roleId: text("role_id").notNull().primaryKey(),
});

export const guildSettingRelations = relations(guildSettings, ({ many }) => ({
	randomBitrateChannels: many(randomBitrate, {
		relationName: "randomBitrateChannels",
	}),
	roleMenus: many(roleMenu, {
		relationName: "roleMenus",
	}),
	quickMessages: many(quickMessage, {
		relationName: "quickMessages",
	}),
	autoRoles: many(autoRoles, {
		relationName: "autoRoles",
	}),
	rolePermissions: many(rolePermissions, {
		relationName: "rolePermissions",
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

export const reminders = pgTable("reminders", {
	reminderId: serial("reminder_id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => userData.userId, { onDelete: "cascade" }),
	reminderName: text("reminder_name").notNull(),
	reminderTime: timestamp("reminder_time").notNull(),
});
