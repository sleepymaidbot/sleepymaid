import { sql } from 'drizzle-orm';
import { pgTable, pgEnum, text, integer, serial, boolean } from 'drizzle-orm/pg-core';

export const levelingTrackType = pgEnum('LevelingTrackType', ['levels', 'points']);

export const levelingTrack = pgTable('LevelingTrack', {
	guildId: text('guildId')
		.notNull()
		.references(() => guildsSettings.guildId, { onDelete: 'cascade' }),
	trackId: serial('trackId').primaryKey().notNull(),
	trackName: text('trackName').notNull(),
	type: levelingTrackType('type').notNull(),
	globalMultiplier: integer('globalMultiplier').default(1).notNull(),
});

export const trackBlacklistedRole = pgTable('TrackBlacklistedRole', {
	guildId: text('guildId').notNull(),
	trackId: integer('trackId')
		.notNull()
		.references(() => levelingTrack.trackId, { onDelete: 'cascade' }),
	roleId: text('roleId').primaryKey().notNull(),
});

export const trackWhitelistedRole = pgTable('TrackWhitelistedRole', {
	guildId: text('guildId').notNull(),
	trackId: integer('trackId')
		.notNull()
		.references(() => levelingTrack.trackId, { onDelete: 'cascade' }),
	roleId: text('roleId').primaryKey().notNull(),
});

export const trackRoleMultiplier = pgTable('TrackRoleMultiplier', {
	guildId: text('guildId').notNull(),
	trackId: integer('trackId')
		.notNull()
		.references(() => levelingTrack.trackId, { onDelete: 'cascade' }),
	roleId: text('roleId').primaryKey().notNull(),
	multiplier: integer('multiplier').default(1).notNull(),
});

export const trackChannelMultiplier = pgTable('TrackChannelMultiplier', {
	guildId: text('guildId').notNull(),
	trackId: integer('trackId')
		.notNull()
		.references(() => levelingTrack.trackId, { onDelete: 'cascade' }),
	channelId: text('channelId').primaryKey().notNull(),
	multiplier: integer('multiplier').default(1).notNull(),
});

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
