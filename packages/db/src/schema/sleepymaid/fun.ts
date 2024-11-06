import { pgTable, text, integer, index, serial } from "drizzle-orm/pg-core";
import { userData } from "./schema";

export const userActions = pgTable(
	"user_action",
	{
		id: serial("id").primaryKey().notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => userData.userId, { onDelete: "cascade" }),
		targetId: text("target_id").notNull(),
		hug: integer("hug").default(0).notNull(),
		pat: integer("pat").default(0).notNull(),
		bite: integer("bite").default(0).notNull(),
		nom: integer("nom").default(0).notNull(),
		lick: integer("lick").default(0).notNull(),
		cuddle: integer("cuddle").default(0).notNull(),
		eat: integer("eat").default(0).notNull(),
		hello: integer("hello").default(0).notNull(),
		highfive: integer("highfive").default(0).notNull(),
		kill: integer("kill").default(0).notNull(),
		kiss: integer("kiss").default(0).notNull(),
		poke: integer("poke").default(0).notNull(),
		pout: integer("pout").default(0).notNull(),
		punch: integer("punch").default(0).notNull(),
		shrug: integer("shrug").default(0).notNull(),
		sleep: integer("sleep").default(0).notNull(),
		slap: integer("slap").default(0).notNull(),
		tickle: integer("tickle").default(0).notNull(),
		wink: integer("wink").default(0).notNull(),
		dance: integer("dance").default(0).notNull(),
		wave: integer("wave").default(0).notNull(),
		cheer: integer("cheer").default(0).notNull(),
		fistbump: integer("fistbump").default(0).notNull(),
		laugh: integer("laugh").default(0).notNull(),
		cry: integer("cry").default(0).notNull(),
	},
	(table) => {
		return {
			userIdx: index("actions_user_idx").on(table.userId),
			targetIdx: index("actions_target_idx").on(table.targetId),
		};
	},
);
