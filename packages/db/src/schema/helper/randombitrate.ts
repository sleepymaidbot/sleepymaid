import { boolean, pgTable, text } from 'drizzle-orm/pg-core';

export const randomBitrate = pgTable('random_bitrate', {
	serverId: text('serverId'),
	channelId: text('channelId').primaryKey(),
	enabled: boolean('boolean').default(false),
});
