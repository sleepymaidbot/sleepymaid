import { createId } from '@paralleldrive/cuid2';
import { relations, sql } from 'drizzle-orm';
import { text, boolean, pgTable, pgEnum, jsonb, integer } from 'drizzle-orm/pg-core';
import { guildsSettings } from './schema';

export const roleMenuType = pgEnum('role_menu_type', ['buttons', 'select']);

export type roleMenuValuesType = {
	description: string | undefined;
	emoji: string | undefined;
	label: string;
	roleId: string;
	style: number;
};

export const roleMenu = pgTable('role_menu', {
	guildId: text('serverId').references(() => guildsSettings.guildId, { onDelete: 'cascade' }),
	roleMenuId: text('roleMenuId')
		.primaryKey()
		.$defaultFn(() => createId()),
	roleMenuName: text('roleMenuName').notNull(),
	channelId: text('channelId').notNull(),
	messageId: text('messageId'),
	enabled: boolean('boolean').default(false).notNull(),
	type: roleMenuType('type').notNull(),
	maxRoles: integer('maxRoles').default(1).notNull(),
	minRoles: integer('minRoles').default(0).notNull(),
	values: jsonb('values')
		.notNull()
		.$type<roleMenuValuesType[]>()
		.default(sql`'[]'`),
});

export const roleMenuRelations = relations(roleMenu, ({ one }) => ({
	guildsSettings: one(guildsSettings, {
		fields: [roleMenu.guildId],
		references: [guildsSettings.guildId],
		relationName: 'roleMenus',
	}),
}));
