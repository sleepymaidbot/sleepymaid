import { bigint, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core"
import { guildSettings, userData } from "./schema"

export const lotteries = pgTable("lottery", {
	lotteryId: serial("lottery_id").primaryKey(),
	guildId: text("guild_id")
		.notNull()
		.references(() => guildSettings.guildId, { onDelete: "cascade" }),
	channelId: text("channel_id").notNull(),
	messageId: text("message_id").notNull(),
	lotteryAmount: bigint("lottery_amount", { mode: "number" }).notNull(),
	effectiveTime: timestamp("effective_time").notNull(),
	expiredTime: timestamp("expired_time").notNull(),
})

export const userLotteries = pgTable("user_lottery", {
	userId: text("user_id")
		.notNull()
		.references(() => userData.userId, { onDelete: "cascade" }),
	lotteryId: integer("lottery_id")
		.notNull()
		.references(() => lotteries.lotteryId, { onDelete: "cascade" }),
})
