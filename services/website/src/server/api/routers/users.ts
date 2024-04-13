import { accounts } from "@sleepymaid/db";
import type { RESTAPIPartialCurrentUserGuild } from "discord-api-types/v10";
import { PermissionFlagsBits } from "discord-api-types/v10";
import { eq } from "drizzle-orm";
import type { Session } from "next-auth";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

const BASE_URL = "https://discord.com/api/v10";

type UserGuilds = RESTAPIPartialCurrentUserGuild & {
  hasBot: boolean | undefined;
  hasPermission: boolean;
};

export const usersRouter = createTRPCRouter({
  getUserGuilds: protectedProcedure.query(async ({ ctx }) => {
    const session: Session = ctx.session;
    const account = await ctx.db.query.accounts.findFirst({
      where: eq(accounts.userId, session.user.id),
    });

    if (!account) {
      return null;
    }

    if (!account.access_token) {
      return null;
    }

    const guilds: RESTAPIPartialCurrentUserGuild[] = await fetch(
      `${BASE_URL}/users/@me/guilds`,
      {
        headers: {
          Authorization: `Bearer ${account.access_token}`,
        },
      },
    ).then(async (res) => res.json());

    const userGuilds: UserGuilds[] = await Promise.all(
      guilds.map((guild) => {
        // TODO: Implement this
        const hasBot = undefined;

        return {
          ...guild,
          hasBot,
          hasPermission:
            guild.owner === true ||
            (BigInt(guild.permissions) & PermissionFlagsBits.Administrator) ===
              PermissionFlagsBits.Administrator ||
            (BigInt(guild.permissions) & PermissionFlagsBits.ManageGuild) ===
              PermissionFlagsBits.ManageGuild,
        };
      }),
    );

    userGuilds.sort((a, b) => {
      if (a.hasPermission && !b.hasPermission) {
        return -1;
      } else if (!a.hasPermission && b.hasPermission) {
        return 1;
      } else {
        return 0;
      }
    });

    return userGuilds;
  }),
});
