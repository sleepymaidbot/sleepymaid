import { Result } from "@sapphire/result";
import { userData, sessionTable } from "@sleepymaid/db";
import { createServerFn } from "@tanstack/start";
import { APIUser, Routes } from "discord-api-types/v10";
import { discord } from "../auth";
import { db } from "../db";
import axios from "redaxios";
import { eq } from "drizzle-orm";
import encryptSessionId from "~/utils/encrypt";
import { useSession } from "~/hooks/useSession";
import * as arctic from "arctic";
import { z } from "zod";

export const loginFn = createServerFn({ method: "GET" })
	.validator(
		z.object({
			code: z.string(),
			state: z.string(),
		}),
	)
	.handler(async (ctx) => {
		const code = ctx.data.code;
		// const state = ctx.data.state;

		const session = await useSession();
		// const storedState = session.data.oauth_state;

		// if (!storedState || storedState !== state) {
		//     throw new Error('Invalid state parameter - possible CSRF attack');
		// }

		// await session.update({
		//     data: {
		//         oauth_state: undefined,
		//     },
		// });

		if (!code) {
			throw new Error("No code provided");
		}

		const tokensResult = await Result.fromAsync(async () => discord.validateAuthorizationCode(code, null));

		if (tokensResult.isErr()) {
			const e = tokensResult.unwrapErr();
			if (e instanceof arctic.OAuth2RequestError) {
				const code = e.code;
				console.log("Code", code);
				throw new Error("Invalid authorization code, credentials, or redirect URI");
			} else if (e instanceof arctic.ArcticFetchError) {
				throw new Error("Failed to call `fetch()`");
			} else {
				throw new Error("Unknown error", e as Error);
			}
		}

		const tokens = tokensResult.unwrap();

		const accessToken = tokens.accessToken();
		const accessTokenExpiresAt = tokens.accessTokenExpiresAt();
		const refreshToken = tokens.refreshToken();

		const data = await axios.get("https://discord.com/api/v10/users/@me", {
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});

		const user: APIUser = data.data;

		let dbUser = await db.query.userData.findFirst({
			where: eq(userData.userId, user.id),
		});

		const SESSION_SECRET = process.env.SESSION_SECRET;

		if (!SESSION_SECRET) {
			throw new Error("SESSION_SECRET environment variable is not set");
		}

		const sessionId = encryptSessionId(user.id, SESSION_SECRET);

		if (!dbUser) {
			const [newUser] = await db
				.insert(userData)
				.values({
					userId: user.id,
					userName: user.username,
					displayName: user.global_name,
					avatarHash: user.avatar,
				})
				.returning();

			if (!newUser) {
				throw new Error("Failed to create user");
			}

			dbUser = newUser;

			await db.insert(sessionTable).values({
				id: sessionId,
				userId: newUser.userId,
				accessToken: accessToken,
				refreshToken: refreshToken,
				expiresAt: accessTokenExpiresAt,
			});
		} else {
			await db.insert(sessionTable).values({
				id: sessionId,
				userId: dbUser.userId,
				accessToken: accessToken,
				refreshToken: refreshToken,
				expiresAt: accessTokenExpiresAt,
			});
		}

		throw await session.update({
			userId: dbUser.userId,
			sessionId: sessionId,
		});
	});
