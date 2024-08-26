import { relations, sql } from "drizzle-orm";
import { pgTable, text, boolean } from "drizzle-orm/pg-core";
import { randomBitrate } from "../helper/randombitrate";
import { roleMenu } from "./rolemenu";
import { quickMessage } from "./quickMessage";

export const guildsSettings = pgTable("GuildsSettings", {
	guildId: text("guildId").primaryKey().notNull(),
	guildName: text("guildname").notNull(),
	guildIcon: text("icon"),
	sanitizerEnabled: boolean("sanitizerEnabled").default(false).notNull(),
	sanitizerIgnoredRoles: text("sanitizerIgnoredRoles")
		.array()
		.default(sql`'{}'`)
		.notNull(),
	adminRoles: text("adminRoles")
		.array()
		.default(sql`'{}'`)
		.notNull(),
	modRoles: text("modRoles")
		.array()
		.default(sql`'{}'`)
		.notNull(),
});

export const guildsSettingsRelations = relations(guildsSettings, ({ many }) => ({
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
