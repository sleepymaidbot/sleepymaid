import { relations, sql } from 'drizzle-orm';
import { pgTable, text, boolean } from 'drizzle-orm/pg-core';
import { randomBitrate } from '../helper/randombitrate';

export const guildsSettings = pgTable('GuildsSettings', {
	guildId: text('guildId').primaryKey().notNull(),
	sanitizerEnabled: boolean('sanitizerEnabled').default(false).notNull(),
	sanitizerIgnoredRoles: text('sanitizerIgnoredRoles')
		.array()
		.default(sql`'{}'`)
		.notNull(),
	adminRoles: text('adminRoles')
		.array()
		.default(sql`'{}'`)
		.notNull(),
	modRoles: text('modRoles')
		.array()
		.default(sql`'{}'`)
		.notNull(),
});

export const guildsSettingsRelations = relations(guildsSettings, ({ many }) => ({
	randomBitrateChannels: many(randomBitrate, {
		relationName: 'randomBitrateChannels',
	}),
}));
