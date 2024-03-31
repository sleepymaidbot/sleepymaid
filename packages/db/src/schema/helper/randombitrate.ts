import { relations } from 'drizzle-orm';
import { boolean, pgTable, text } from 'drizzle-orm/pg-core';
import { guildsSettings } from '../sleepymaid/schema';

export const randomBitrate = pgTable('random_bitrate', {
	guildId: text('serverId').references(() => guildsSettings.guildId, { onDelete: 'cascade' }),
	channelId: text('channelId').primaryKey(),
	enabled: boolean('boolean').default(false),
});

export const randomBitrateRelations = relations(randomBitrate, ({ one }) => ({
	guildsSettings: one(guildsSettings, {
		fields: [randomBitrate.guildId],
		references: [guildsSettings.guildId],
		relationName: 'guildsSettings',
	}),
}));
