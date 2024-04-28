import { accounts, guildsSettings } from "@sleepymaid/db";
import { sendRPCRequest, Queue } from "@sleepymaid/shared";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

export const guildsRouter = createTRPCRouter({
  getGuildSettings: protectedProcedure
    .input(z.object({ guildId: z.string() }))
    .query(async ({ ctx, input }) => {
      console.log("getGuildSettings", input);
      const userId = await ctx.db.query.accounts
        .findFirst({
          where: eq(accounts.userId, ctx.session.user.id),
        })
        .then((user) => user?.providerAccountId);
      if (!userId) {
        return null;
      }

      const response = await sendRPCRequest(
        { guildId: input.guildId, userId },
        Queue.CheckGuildInformation,
        ctx.mqChannel,
      );

      if (!response.hasPermission) {
        return null;
      }

      const settings = await ctx.db.query.guildsSettings.findFirst({
        where: eq(guildsSettings.guildId, input.guildId),
      });

      return {
        settings,
        ...response,
      };
    }),
});
