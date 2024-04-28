import { integer, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";

export const mondecorte = pgTable(
  "mondecorte",
  {
    userId: text("user_id").notNull(),
    customRoleId: text("custom_role_id"),
    points: integer("points").default(0),
    socialCredit: integer("social_credit").default(500),
    vote: text("vote"),
  },
  (table) => {
    return {
      userIdKey: uniqueIndex("mondecorte_user_id_key").on(table.userId),
    };
  },
);
