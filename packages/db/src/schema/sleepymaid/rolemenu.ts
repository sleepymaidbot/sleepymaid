import { createId } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";
import { text, boolean, pgTable, pgEnum, jsonb, integer } from "drizzle-orm/pg-core";
import { guildSetting } from "./schema";

export const roleMenuType = pgEnum("role_menu_type", ["buttons", "select"]);

export type roleMenuValuesType = {
	description: string | undefined;
	emoji: string | undefined;
	label: string;
	roleId: string;
	style: number;
};

export const roleMenu = pgTable("role_menu", {
	guildId: text("server_id").references(() => guildSetting.guildId, { onDelete: "cascade" }),
	roleMenuId: text("role_menu_id")
		.primaryKey()
		.$defaultFn(() => createId()),
	roleMenuName: text("role_menu_name").notNull(),
	channelId: text("channel_id").notNull(),
	messageId: text("message_id"),
	enabled: boolean("boolean").default(false).notNull(),
	type: roleMenuType("type").notNull(),
	maxRoles: integer("max_roles").default(1).notNull(),
	minRoles: integer("min_roles").default(0).notNull(),
	values: jsonb("values")
		.notNull()
		.$type<roleMenuValuesType[]>()
		.default(sql`'[]'`),
});

export const roleMenuRelations = relations(roleMenu, ({ one }) => ({
	guildsSettings: one(guildSetting, {
		fields: [roleMenu.guildId],
		references: [guildSetting.guildId],
		relationName: "roleMenus",
	}),
}));
