import { InferSelectModel, relations, sql } from "drizzle-orm";
import { pgTable, text, boolean, bigint, timestamp, integer, serial } from "drizzle-orm/pg-core";
import { randomBitrate } from "../helper/helper";
import { roleMenu } from "./rolemenu";
import { quickMessage } from "./quickMessage";
import { Permission } from "@sleepymaid/shared";

export const guildSettings = pgTable("guild_settings", {
	// Basic Information
	guildId: text("guild_id").primaryKey().notNull(),
	guildName: text("guild_name").notNull(),
	iconHash: text("icon_hash"),

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
	permission: text("permission").notNull().$type<Permission>(),
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
	avatarHash: text("avatar_hash"),

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

	// Linked roles
	// { access_token: string, refresh_token: string, expires_at: number }
	linkedRolesAccessTokens: text("linked_roles_access_tokens"),
	linkedRolesRefreshTokens: text("linked_roles_refresh_tokens"),
	linkedRolesExpiresAt: timestamp("linked_roles_expires_at"),
});

export const reminders = pgTable("reminders", {
	reminderId: serial("reminder_id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => userData.userId, { onDelete: "cascade" }),
	reminderName: text("reminder_name").notNull(),
	reminderTime: timestamp("reminder_time").notNull(),
});

export const sessionTable = pgTable("session", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => userData.userId),
	accessToken: text("access_token").notNull(),
	expiresAt: timestamp("expires_at", {
		withTimezone: true,
		mode: "date",
	}).notNull(),
	refreshToken: text("refresh_token").notNull(),
});

export type User = InferSelectModel<typeof userData>;
export type Session = InferSelectModel<typeof sessionTable>;
export type Reminder = InferSelectModel<typeof reminders>;

export const roleConnections = pgTable("role_connections", {
	guildId: text("guild_id")
		.notNull()
		.references(() => guildSettings.guildId, { onDelete: "cascade" }),
	parentRoleId: text("parent_role_id").notNull(),
	childRoleId: text("child_role_id").notNull(),
});
