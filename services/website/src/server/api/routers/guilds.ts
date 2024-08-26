import { accounts, guildsSettings } from "@sleepymaid/db";
import { sendRPCRequest, Queue } from "@sleepymaid/shared";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { createId } from "@paralleldrive/cuid2";
import { quickMessage } from "@sleepymaid/db";

const quickMessageSchema = z.object({
	guildId: z.string(),
	messageName: z.string(),
	channelId: z.string(),
	messageId: z.string().optional(),
	messageJson: z.string(),
});

export const guildsRouter = createTRPCRouter({
	getGuildSettings: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
		console.log("getGuildSettings", input);
		const userId = await ctx.db.query.accounts
			.findFirst({
				where: eq(accounts.userId, ctx.session.user.id),
			})
			.then((user) => user?.providerAccountId);
		if (!userId) {
			return null;
		}

		const response = await sendRPCRequest({ guildId: input, userId }, Queue.CheckGuildInformation, ctx.mqChannel);

		if (!response.hasPermission) {
			return null;
		}

		const guildSettings = await ctx.db.query.guildsSettings.findFirst({
			where: eq(guildsSettings.guildId, input),
		});

		return {
			guildSettings,
			...response,
		};
	}),
	sendQuickMessage: protectedProcedure.input(quickMessageSchema).mutation(async ({ ctx, input }) => {
		console.log("sendQuickMessage", input);

		const userId = await ctx.db.query.accounts
			.findFirst({
				where: eq(accounts.userId, ctx.session.user.id),
			})
			.then((user) => user?.providerAccountId);
		if (!userId) {
			return null;
		}

		const userPermissions = await sendRPCRequest(
			{ guildId: input.guildId, userId },
			Queue.CheckUserGuildPermissions,
			ctx.mqChannel,
		);

		if (!userPermissions.admin) {
			return null;
		}

		const messageUUID = createId();

		await ctx.db.insert(quickMessage).values({
			guildId: input.guildId,
			channelId: input.channelId,
			messageId: input.messageId,
			messageName: input.messageName,
			messageUUID,
			messageData: input.messageJson,
		});

		const response = await sendRPCRequest({ ...input, userId }, Queue.SendQuickMessage, ctx.mqChannel);

		if (!response.messageId) {
			return null;
		}
	}),
});
